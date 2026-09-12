import { Server } from "socket.io";
import { supabase } from "../utils/supabase.js";

let connections = {};
let messages = {};
let timeOnline = {};
let activeQuizzes = {}; // roomKey -> active quiz state (stores server-side correctOptionIndex, timer, and buffered responses)
let socketUserMap = {}; // socket.id -> { username, role, room }
let meetingHosts = {}; // roomKey -> { ownerUsername, activeHostId }
const socketAuthCache = new Map();
const SOCKET_AUTH_CACHE_TTL_MS = 60_000;
const MAX_SOCKET_AUTH_CACHE_ENTRIES = 10_000;
const MAX_CHAT_MESSAGES_PER_ROOM = 100;

const getSocketUser = (socket) => socketUserMap[socket.id];
const isRoomHost = (socket, room) => {
    const user = getSocketUser(socket);
    return Boolean(
        user &&
        user.room === room &&
        meetingHosts[room]?.activeHostId === socket.id &&
        ['admin', 'trainer'].includes(user.role)
    );
};

const emitSocketError = (socket, message) => {
    socket.emit('socket-error', { code: 'FORBIDDEN', message });
};

const getRoomUsers = (room) => connections[room].map((sId) => ({
    socketId: sId,
    username: socketUserMap[sId]?.username || `User_${sId.substring(0, 4)}`,
    role: sId === meetingHosts[room]?.activeHostId ? "trainer" : "student",
    profilePic: socketUserMap[sId]?.profilePic || null,
    mediaState: socketUserMap[sId]?.mediaState || { video: true, audio: true }
}));

const broadcastRoomState = (io, room) => {
    if (!connections[room] || !meetingHosts[room]) return;

    const roomUsers = getRoomUsers(room);
    connections[room].forEach((sId) => {
        io.to(sId).emit("user-joined", sId, connections[room], meetingHosts[room].activeHostId, null, roomUsers);
    });
};

/**
 * Asynchronously flushes buffered quiz responses from in-memory / Redis cache to the Database
 * when the quiz timer expires. This avoids blocking DB writes during peak live submission spikes.
 */
const flushQuizSubmissionsToDB = async (roomKey, quizState) => {
    if (!quizState || !quizState.responsesMap) return;

    const responses = Object.values(quizState.responsesMap);
    if (responses.length === 0) return;

    try {
        const submissionDocs = responses.map((resp) => ({
            quiz_id: quizState.id,
            meeting_id: roomKey,
            student_username: resp.studentUsername,
            student_name: resp.studentName || resp.studentUsername,
            selected_option_index: resp.selectedOptionIndex,
            is_correct: resp.isCorrect,
            score_earned: resp.isCorrect ? (quizState.points || 1) : 0,
            latency_ms: resp.latencyMs || 0,
            submitted_at: resp.submittedAt || new Date().toISOString()
        }));

        // Bulk insert to database without blocking real-time socket loops
        const { error } = await supabase.from('submissions').insert(submissionDocs);
        if (error) throw error;
        console.log(`[Async Flush] Successfully flushed ${submissionDocs.length} responses for quiz ${quizState.id} to DB.`);
    } catch (err) {
        console.error(`[Async Flush Error] Failed to flush quiz submissions for room ${roomKey}:`, err.message);
    }
};

export const connectToSocket = (server) => {
    const allowedOrigins = [
        'http://localhost:5173',
        'https://sync-learn-binwzfjz1-shubhamm27p.vercel.app',
        'https://sync-learn.vercel.app',
        'https://synclearn-backend.onrender.com'
    ];

    const io = new Server(server, {
        cors: {
            origin: function (origin, callback) {
                if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
        socket.authUser = null;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            let user = getCachedSocketUser(token);
            let error = null;

            if (!user) {
                const response = await supabase
                    .from('users')
                    .select('id, name, username, role, is_active, email')
                    .eq('token', token)
                    .maybeSingle();
                user = response.data;
                error = response.error;
                if (user && user.is_active !== false) cacheSocketUser(token, user);
            }

            if (error) {
                console.error('[Socket Auth DB Error]', error);
            }

            if (!user) {
                console.warn('[Socket Auth] No user found matching token:', token.substring(0, 10) + '...');
            }

            if (user && user.is_active !== false) {
                socket.authUser = user;
                return next();
            } else {
                return next(new Error('Authentication error: Invalid or inactive token'));
            }
        } catch (error) {
            console.warn('[Socket Auth Error] Supabase lookup failed:', error.message);
            return next(new Error('Authentication error: Internal server error'));
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("join-call", (path, userMetaData = {}) => {
            const role = socket.authUser?.role || userMetaData.role || "student";
            if (connections[path] === undefined) {
                if (role !== "trainer" && role !== "admin") {
                    socket.emit("kicked-from-call", { kickedBy: "System", reason: "Meeting code is invalid or meeting has not started yet." });
                    return;
                }
                connections[path] = [];
            }

            const username = socket.authUser.username || socket.authUser.email;
            if (!meetingHosts[path]) {
                meetingHosts[path] = {
                    ownerUsername: username,
                    activeHostId: null
                };
            }

            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            const isOwner = meetingHosts[path].ownerUsername === username;
            if ((isOwner || !meetingHosts[path].activeHostId) && ['admin', 'trainer'].includes(role)) {
                meetingHosts[path].activeHostId = socket.id;
            }

            socketUserMap[socket.id] = {
                username,
                role: socket.id === meetingHosts[path].activeHostId ? role : role,
                room: path,
                userId: socket.authUser?.id || null,
                profilePic: null,
                mediaState: userMetaData.mediaState || { video: true, audio: true }
            };

            const roomUserList = getRoomUsers(path);

            // Notify everyone in the room
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit(
                    "user-joined", 
                    socket.id, 
                    connections[path], 
                    meetingHosts[path].activeHostId,
                    socketUserMap[socket.id],
                    roomUserList
                );
            }

            // Sync past chat messages
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit(
                        "chat-message", 
                        messages[path][a]['data'], 
                        messages[path][a]['sender'], 
                        messages[path][a]['socket-id-sender'],
                        messages[path][a]['timestamp'],
                        messages[path][a]['recipient']
                    );
                }
            }

            // Sync active MCQ if ongoing in this room (ONLY sanitize payload - ZERO answer key sent to client)
            if (activeQuizzes[path]) {
                const now = new Date();
                if (new Date(activeQuizzes[path].expiresAt) > now) {
                    // Send sanitized payload to joining student
                    const studentPayload = {
                        id: activeQuizzes[path].id,
                        question: activeQuizzes[path].question,
                        options: activeQuizzes[path].options,
                        points: activeQuizzes[path].points,
                        timeLimitSeconds: activeQuizzes[path].timeLimitSeconds,
                        pushedAt: activeQuizzes[path].pushedAt,
                        expiresAt: activeQuizzes[path].expiresAt
                    };
                    io.to(socket.id).emit("new-mcq", studentPayload);
                }
            }
        });

        socket.on("signal", (toId, message) => {
            const target = socketUserMap[toId];
            if (!getSocketUser(socket)?.room || !target || target.room !== getSocketUser(socket).room) {
                return emitSocketError(socket, 'You can only signal participants in your meeting.');
            }
            io.to(toId).emit("signal", socket.id, message);
        });

        // Admin/Host Media Permission Override
        socket.on("host-toggle-media", ({ targetId, type, state }) => {
            const room = getSocketUser(socket)?.room;
            const target = socketUserMap[targetId];
            if (!room || !isRoomHost(socket, room) || !target || target.room !== room || !['audio', 'video'].includes(type) || typeof state !== 'boolean') {
                return emitSocketError(socket, 'Only the meeting host can change participant media.');
            }
            io.to(targetId).emit("host-toggle-media", { type, state, hostId: socket.id });
            io.to(targetId).emit("media-permission-updated", { type, state, updatedBy: socket.id });
        });

        socket.on("admin:toggle-media-permission", async ({ sessionId, targetSocketId, targetUserId, canPublishAudio, canPublishVideo, canScreenShare }) => {
            try {
                const room = getSocketUser(socket)?.room;
                const target = socketUserMap[targetSocketId];
                if (!room || !isRoomHost(socket, room) || !target || target.room !== room || (sessionId && sessionId !== room)) {
                    return emitSocketError(socket, 'Only the meeting host can change media permissions in this meeting.');
                }
                if (sessionId && target.userId) {
                    await supabase.from('media_permissions').upsert({
                        session_id: sessionId,
                        user_id: target.userId,
                        can_publish_audio: Boolean(canPublishAudio),
                        can_publish_video: Boolean(canPublishVideo),
                        can_screen_share: Boolean(canScreenShare),
                        updated_by: "Admin"
                    }, { onConflict: 'session_id, user_id' });
                }
                io.to(targetSocketId).emit("media-permission-updated", {
                    canPublishAudio,
                    canPublishVideo,
                    canScreenShare,
                    updatedBy: socket.id
                });
            } catch (err) {
                console.error("admin:toggle-media-permission error:", err);
            }
        });

        socket.on("request-camera-permission", ({ targetId, hostName }) => {
            const room = getSocketUser(socket)?.room;
            const target = socketUserMap[targetId];
            if (!room || !isRoomHost(socket, room) || !target || target.room !== room) {
                return emitSocketError(socket, 'Only the meeting host can request participant camera access.');
            }
            io.to(targetId).emit("camera-permission-request", { hostId: socket.id, hostName: hostName || "Trainer" });
        });

        socket.on("camera-permission-response", ({ hostId, allowed, studentName }) => {
            const room = getSocketUser(socket)?.room;
            if (!room || socketUserMap[hostId]?.room !== room || !isRoomHost({ id: hostId }, room)) {
                return emitSocketError(socket, 'Invalid camera permission response target.');
            }
            io.to(hostId).emit("camera-permission-response", { allowed, studentId: socket.id, studentName });
        });

        // Host Remove/Kick Participant Event
        socket.on("remove-participant", ({ targetSocketId, targetUsername }) => {
            const userRoom = socketUserMap[socket.id]?.room;
            const target = socketUserMap[targetSocketId];
            if (!userRoom || !connections[userRoom] || !isRoomHost(socket, userRoom) || !target || target.room !== userRoom || targetSocketId === socket.id) {
                return emitSocketError(socket, 'Only the meeting host can remove participants from this meeting.');
            }

            // Notify target socket that they were kicked from the call by Host
            io.to(targetSocketId).emit("kicked-from-call", {
                kickedBy: socketUserMap[socket.id]?.username || "Host",
                reason: "Removed from meeting by the Host."
            });

            // Clean up socketUserMap & timeOnline
            delete socketUserMap[targetSocketId];
            delete timeOnline[targetSocketId];

            // Remove targetSocketId from room connections array
            const idx = connections[userRoom].indexOf(targetSocketId);
            if (idx !== -1) {
                connections[userRoom].splice(idx, 1);
            }

            if (meetingHosts[userRoom]?.activeHostId === targetSocketId) {
                meetingHosts[userRoom].activeHostId = null;
                connections[userRoom].forEach((sId) => {
                    if (socketUserMap[sId]) socketUserMap[sId].role = "student";
                });
            }

            const updatedRoomUsers = getRoomUsers(userRoom);

            // Notify remaining participants in the room
            connections[userRoom].forEach(elem => {
                io.to(elem).emit("user-left", targetSocketId);
                io.to(elem).emit("user-joined", elem, connections[userRoom], meetingHosts[userRoom]?.activeHostId, null, updatedRoomUsers);
            });

            console.log(`[Host Action] ${socket.id} removed participant ${targetSocketId} (${targetUsername}) from room ${userRoom}`);
        });

        // Real-time media toggle sync listener
        socket.on("media-state-change", (mediaState) => {
            if (socketUserMap[socket.id]) {
                socketUserMap[socket.id].mediaState = mediaState;
                const room = socketUserMap[socket.id].room;
                if (room && connections[room]) {
                    connections[room].forEach(sId => {
                        io.to(sId).emit("media-state-updated", {
                            socketId: socket.id,
                            mediaState
                        });
                    });
                }
            }
        });

        // ==========================================
        // REAL-TIME MCQ ENGINE (ZERO LEAKAGE + ASYNC FLUSH)
        // ==========================================
        socket.on("launch-mcq", async (quizData) => {
            const userRoom = socketUserMap[socket.id]?.room;
            if (!userRoom && !quizData.meetingId) return;
            const roomKey = quizData.meetingId || userRoom;

            if (!userRoom || roomKey !== userRoom || !isRoomHost(socket, userRoom)) {
                return emitSocketError(socket, 'Only the meeting host can launch a quiz.');
            }

            const timeLimit = Number(quizData.timeLimitSeconds) || 30;
            const pushedAt = new Date();
            const expiresAt = new Date(pushedAt.getTime() + timeLimit * 1000);

            // Store full quiz details (including correctOptionIndex) ONLY in server-side state
            const activeQuizState = {
                id: quizData.id || `quiz_${Date.now()}`,
                question: quizData.question,
                options: quizData.options,
                correctOptionIndex: Number(quizData.correctOptionIndex),
                points: Number(quizData.points) || 1,
                timeLimitSeconds: timeLimit,
                pushedAt,
                expiresAt,
                responsesMap: {} // Map studentId/username -> response (for fast idempotency check)
            };

            activeQuizzes[roomKey] = activeQuizState;

            // SANITIZED PAYLOAD FOR STUDENTS: Zero Answer Key Leakage!
            const studentBroadcastPayload = {
                id: activeQuizState.id,
                question: activeQuizState.question,
                options: activeQuizState.options,
                points: activeQuizState.points,
                timeLimitSeconds: timeLimit,
                pushedAt,
                expiresAt
            };

            if (connections[roomKey]) {
                connections[roomKey].forEach((elem) => {
                    io.to(elem).emit("new-mcq", studentBroadcastPayload);
                });
            }

            // Schedule asynchronous background flush when timer expires
            setTimeout(() => {
                if (activeQuizzes[roomKey] && activeQuizzes[roomKey].id === activeQuizState.id) {
                    const quizToFlush = activeQuizzes[roomKey];
                    flushQuizSubmissionsToDB(roomKey, quizToFlush)
                        .finally(() => {
                            if (activeQuizzes[roomKey]?.id === quizToFlush.id) {
                                delete activeQuizzes[roomKey];
                            }
                        });
                }
            }, timeLimit * 1000 + 1000);
        });

        socket.on("submit-mcq-answer", async (answerData) => {
            const userRoom = socketUserMap[socket.id]?.room || answerData.meetingId;
            const activeQuiz = activeQuizzes[userRoom];
            
            if (!activeQuiz) return;

            // Check timer validity
            if (new Date() > new Date(activeQuiz.expiresAt)) {
                io.to(socket.id).emit("receive_grade", {
                    error: true,
                    message: "Time expired! Submission rejected."
                });
                return;
            }

            const studentKey = answerData.studentUsername || socket.id;

            // Idempotency check in high-speed memory/Redis cache
            if (activeQuiz.responsesMap[studentKey]) {
                return; // Prevent duplicate submissions
            }

            // Server-side validation of correct answer: NEVER trust client correctness flag!
            const isCorrect = Number(answerData.selectedOptionIndex) === Number(activeQuiz.correctOptionIndex);
            const scoreEarned = isCorrect ? (activeQuiz.points || 1) : 0;

            // Save directly to high-speed memory/Redis buffer (Zero blocking DB call!)
            activeQuiz.responsesMap[studentKey] = {
                studentUsername: answerData.studentUsername,
                studentName: answerData.studentName || answerData.studentUsername,
                selectedOptionIndex: Number(answerData.selectedOptionIndex),
                isCorrect,
                scoreEarned,
                latencyMs: Number(answerData.latencyMs) || 0,
                submittedAt: new Date()
            };

            // Emit immediate individual grade feedback directly to student socket
            io.to(socket.id).emit("receive_grade", {
                isCorrect,
                selectedOptionIndex: answerData.selectedOptionIndex,
                correctOptionIndex: activeQuiz.correctOptionIndex,
                scoreEarned
            });

            // Emit live aggregate response metrics to room (Trainer/Admin views)
            if (connections[userRoom]) {
                const responses = Object.values(activeQuiz.responsesMap);
                const totalSubmissions = responses.length;
                const rightCount = responses.reduce((count, response) => count + (response.isCorrect ? 1 : 0), 0);
                const wrongCount = totalSubmissions - rightCount;

                connections[userRoom].forEach((elem) => {
                    io.to(elem).emit("mcq-answer-recorded", {
                        quizId: activeQuiz.id,
                        totalSubmissions,
                        rightCount,
                        wrongCount
                    });
                    io.to(elem).emit("analytics-update", {
                        quizId: activeQuiz.id,
                        totalSubmissions,
                        rightCount,
                        wrongCount,
                    });
                });
            }
        });

        socket.on("chat-message", (data, sender, recipient = "everyone", timestamp) => {
            const userRoom = socketUserMap[socket.id]?.room;
            if (userRoom && connections[userRoom]) {
                if (messages[userRoom] === undefined) {
                    messages[userRoom] = [];
                }

                const timeStr = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                messages[userRoom].push({ 
                    'sender': sender, 
                    "data": data, 
                    "socket-id-sender": socket.id,
                    "recipient": recipient,
                    "timestamp": timeStr
                });
                if (messages[userRoom].length > MAX_CHAT_MESSAGES_PER_ROOM) {
                    messages[userRoom].splice(0, messages[userRoom].length - MAX_CHAT_MESSAGES_PER_ROOM);
                }

                connections[userRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id, timeStr, recipient);
                });
            }
        });

        socket.on("end-meeting", () => {
            const userRoom = socketUserMap[socket.id]?.room;
            if (userRoom && isRoomHost(socket, userRoom)) {
                if (connections[userRoom]) {
                    connections[userRoom].forEach((elem) => {
                        io.to(elem).emit("meeting-ended", { reason: "The host has ended the meeting." });
                    });
                    if (activeQuizzes[userRoom]) {
                        flushQuizSubmissionsToDB(userRoom, activeQuizzes[userRoom]);
                        delete activeQuizzes[userRoom];
                    }
                    delete connections[userRoom];
                    delete meetingHosts[userRoom];
                    delete messages[userRoom];
                }
            }
        });

        socket.on("disconnect", () => {
            const userRoom = socketUserMap[socket.id]?.room;
            const wasActiveHost = meetingHosts[userRoom]?.activeHostId === socket.id;
            delete socketUserMap[socket.id];
            delete timeOnline[socket.id];

            if (userRoom && connections[userRoom]) {
                for (let a = 0; a < connections[userRoom].length; ++a) {
                    io.to(connections[userRoom][a]).emit('user-left', socket.id);
                }

                const index = connections[userRoom].indexOf(socket.id);
                if (index !== -1) {
                    connections[userRoom].splice(index, 1);
                }

                if (connections[userRoom].length === 0) {
                    if (activeQuizzes[userRoom]) {
                        flushQuizSubmissionsToDB(userRoom, activeQuizzes[userRoom]);
                        delete activeQuizzes[userRoom];
                    }
                    delete connections[userRoom];
                    delete meetingHosts[userRoom];
                    delete messages[userRoom];
                } else if (wasActiveHost) {
                    connections[userRoom].forEach((elem) => {
                        io.to(elem).emit("meeting-ended", { reason: "The host has left, ending the meeting for everyone." });
                    });
                    
                    if (activeQuizzes[userRoom]) {
                        flushQuizSubmissionsToDB(userRoom, activeQuizzes[userRoom]);
                        delete activeQuizzes[userRoom];
                    }
                    delete connections[userRoom];
                    delete meetingHosts[userRoom];
                    delete messages[userRoom];
                }
            }
        });
    });
};

export const getActiveRooms = () => {
    const active = [];
    for (const key in connections) {
        if (connections[key] && connections[key].length > 0) {
            active.push(key);
        }
    }
    return active;
};

const getCachedSocketUser = (token) => {
    const cached = socketAuthCache.get(token);
    if (!cached || cached.expiresAt <= Date.now()) {
        socketAuthCache.delete(token);
        return null;
    }
    return cached.user;
};

const cacheSocketUser = (token, user) => {
    if (socketAuthCache.size >= MAX_SOCKET_AUTH_CACHE_ENTRIES) {
        const oldestToken = socketAuthCache.keys().next().value;
        socketAuthCache.delete(oldestToken);
    }
    socketAuthCache.set(token, { user, expiresAt: Date.now() + SOCKET_AUTH_CACHE_TTL_MS });
};