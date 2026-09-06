import { Server } from "socket.io";
import { supabase } from "../utils/supabase.js";

let connections = {};
let messages = {};
let timeOnline = {};
let activeQuizzes = {}; // roomKey -> active quiz state (stores server-side correctOptionIndex, timer, and buffered responses)
let socketUserMap = {}; // socket.id -> { username, role, room }

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

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("join-call", (path, userMetaData = {}) => {
            if (connections[path] === undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();
            
            const isFirstInRoom = connections[path][0] === socket.id;
            socketUserMap[socket.id] = {
                username: userMetaData.username || `User_${socket.id.substring(0, 4)}`,
                role: userMetaData.role || (isFirstInRoom ? "trainer" : "student"),
                room: path
            };

            const roomUserList = connections[path].map(sId => ({
                socketId: sId,
                username: socketUserMap[sId]?.username || `User_${sId.substring(0, 4)}`,
                role: socketUserMap[sId]?.role || (connections[path][0] === sId ? "trainer" : "student")
            }));

            // Notify everyone in the room
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit(
                    "user-joined", 
                    socket.id, 
                    connections[path], 
                    connections[path][0],
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
                        messages[path][a]['socket-id-sender']
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
            io.to(toId).emit("signal", socket.id, message);
        });

        // Admin/Host Media Permission Override
        socket.on("host-toggle-media", ({ targetId, type, state }) => {
            io.to(targetId).emit("host-toggle-media", { type, state, hostId: socket.id });
            io.to(targetId).emit("media-permission-updated", { type, state, updatedBy: socket.id });
        });

        socket.on("admin:toggle-media-permission", async ({ sessionId, targetSocketId, targetUserId, canPublishAudio, canPublishVideo, canScreenShare }) => {
            try {
                if (sessionId && targetUserId) {
                    await supabase.from('media_permissions').upsert({
                        session_id: sessionId,
                        user_id: targetUserId,
                        can_publish_audio: canPublishAudio,
                        can_publish_video: canPublishVideo,
                        can_screen_share: canScreenShare,
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
            io.to(targetId).emit("camera-permission-request", { hostId: socket.id, hostName: hostName || "Trainer" });
        });

        socket.on("camera-permission-response", ({ hostId, allowed, studentName }) => {
            io.to(hostId).emit("camera-permission-response", { allowed, studentId: socket.id, studentName });
        });

        // Host Remove/Kick Participant Event
        socket.on("remove-participant", ({ targetSocketId, targetUsername }) => {
            const userRoom = socketUserMap[socket.id]?.room;
            if (!userRoom || !connections[userRoom]) return;

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

            const updatedRoomUsers = connections[userRoom].map(sId => ({
                socketId: sId,
                username: socketUserMap[sId]?.username || `User_${sId.substring(0, 4)}`,
                role: socketUserMap[sId]?.role || (connections[userRoom][0] === sId ? "trainer" : "student")
            }));

            // Notify remaining participants in the room
            connections[userRoom].forEach(elem => {
                io.to(elem).emit("user-left", targetSocketId);
                io.to(elem).emit("user-joined", elem, connections[userRoom], connections[userRoom][0], null, updatedRoomUsers);
            });

            console.log(`[Host Action] ${socket.id} removed participant ${targetSocketId} (${targetUsername}) from room ${userRoom}`);
        });

        // ==========================================
        // REAL-TIME MCQ ENGINE (ZERO LEAKAGE + ASYNC FLUSH)
        // ==========================================
        socket.on("launch-mcq", async (quizData) => {
            const userRoom = socketUserMap[socket.id]?.room;
            if (!userRoom && !quizData.meetingId) return;
            const roomKey = quizData.meetingId || userRoom;

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
                    flushQuizSubmissionsToDB(roomKey, activeQuizzes[roomKey]);
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
                const totalSubmissions = Object.keys(activeQuiz.responsesMap).length;
                const rightCount = Object.values(activeQuiz.responsesMap).filter(r => r.isCorrect).length;
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
                        responses: Object.values(activeQuiz.responsesMap)
                    });
                });
            }
        });

        socket.on("chat-message", (data, sender) => {
            const userRoom = socketUserMap[socket.id]?.room;
            if (userRoom && connections[userRoom]) {
                if (messages[userRoom] === undefined) {
                    messages[userRoom] = [];
                }

                messages[userRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id });

                connections[userRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            const userRoom = socketUserMap[socket.id]?.room;
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
                }
            }
        });
    });
};
