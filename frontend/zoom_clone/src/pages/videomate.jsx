import React, { useEffect, useRef, useState, useContext } from "react";
import io from "socket.io-client";
import styles from "../styles/videoComponentModule.module.css";
import {
  Avatar,
  Badge,
  Button,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  Select,
  MenuItem
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import CheckIcon from '@mui/icons-material/Check';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RemoveIcon from '@mui/icons-material/Remove';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../contents/AuthContents";

const server_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        { "urls": "stun:stun1.l.google.com:19302" },
        { "urls": "stun:stun2.l.google.com:19302" },
        {
            "urls": "turn:openrelay.metered.ca:80",
            "username": "openrelayproject",
            "credential": "openrelayproject"
        },
        {
            "urls": "turn:openrelay.metered.ca:443",
            "username": "openrelayproject",
            "credential": "openrelayproject"
        },
        {
            "urls": "turn:openrelay.metered.ca:443?transport=tcp",
            "username": "openrelayproject",
            "credential": "openrelayproject"
        }
    ]
};

export default function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();

    const connectionsRef = useRef({});
    const iceCandidatesQueueRef = useRef({});
    const autoLeaveTimerRef = useRef(null);

    const {
        userData,
        currentUser,
        userRole: contextRole,
        createQuizApi,
        submitQuizApi,
        getQuizRecordsApi
    } = useContext(AuthContext);

    const getStoredUser = () => {
        try {
            const val = localStorage.getItem("currentUser");
            return val && val !== "undefined" && val !== "null" ? JSON.parse(val) : null;
        } catch (e) {
            return null;
        }
    };
    const storedUser = getStoredUser();
    const authUser = currentUser || storedUser || userData;
    const token = localStorage.getItem("token");
    const isAuthenticated = Boolean(token && (authUser?.name || authUser?.username));
    const defaultUsername = authUser?.name || authUser?.username || "";

    const userRole = contextRole || localStorage.getItem("userRole") || "student";

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [screen, setScreen] = useState(false);
    let [showModal, setModal] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState(false);
    let [message, setMessage] = useState("");
    let [messages, setMessages] = useState([]);
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState(defaultUsername);

    useEffect(() => {
        if (isAuthenticated && defaultUsername) {
            setUsername(defaultUsername);
        }
    }, [defaultUsername, isAuthenticated]);

    let [isHost, setIsHost] = useState(false);
    let [hostId, setHostId] = useState(null);

    let [snackbarMsg, setSnackbarMsg] = useState("");
    let [openSnackbar, setOpenSnackbar] = useState(false);

    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);
    const [peerMediaStates, setPeerMediaStates] = useState({});

    // MCQ Quiz States
    const [mcqModalOpen, setMcqModalOpen] = useState(false);
    const [mcqQuestion, setMcqQuestion] = useState("");
    const [mcqOptions, setMcqOptions] = useState(["", "", "", ""]);
    const [mcqCorrectIndex, setMcqCorrectIndex] = useState(0);

    const [activeMcq, setActiveMcq] = useState(null);
    const [studentSelectedOption, setStudentSelectedOption] = useState(null);
    const [quizFeedback, setQuizFeedback] = useState(null);

    const [mcqAnalytics, setMcqAnalytics] = useState(null);
    const [mcqTimeLeft, setMcqTimeLeft] = useState(30);

    const [mcqRecordsOpen, setMcqRecordsOpen] = useState(false);
    const [quizRecords, setQuizRecords] = useState({ total: 0, rightCount: 0, wrongCount: 0, submissions: [] });
    const [evalTabValue, setEvalTabValue] = useState(0);
    const [roomParticipants, setRoomParticipants] = useState([]);

    // Student Personal Score States
    const [studentScoreModalOpen, setStudentScoreModalOpen] = useState(false);
    const [studentScoreHistory, setStudentScoreHistory] = useState([]);

    // Camera Permission States
    const [cameraReqDialogOpen, setCameraReqDialogOpen] = useState(false);
    const [cameraReqHostId, setCameraReqHostId] = useState("");
    const [cameraReqHostName, setCameraReqHostName] = useState("");

    // Top Info Shield Popover States
    const [infoPopoverOpen, setInfoPopoverOpen] = useState(false);
    const [copiedIdTooltip, setCopiedIdTooltip] = useState(false);
    const popoverRef = useRef(null);

    // Participants Modal State
    const [participantsModalOpen, setParticipantsModalOpen] = useState(false);

    // Chat Sidebar Extra States
    const [chatRecipient, setChatRecipient] = useState("everyone");
    const chatEndRef = useRef(null);
    const chatInputRef = useRef(null);

    // Self Video Drag & Position State
    const [selfVideoPos, setSelfVideoPos] = useState({ x: 20, y: window.innerHeight - 200 });
    const [isDraggingSelfVideo, setIsDraggingSelfVideo] = useState(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    // MCQ Widget Drag, Position & Minimize States
    const [mcqCardPos, setMcqCardPos] = useState({ x: 24, y: 80 });
    const [isDraggingMcqCard, setIsDraggingMcqCard] = useState(false);
    const [mcqMinimized, setMcqMinimized] = useState(false);
    const mcqDragOffsetRef = useRef({ x: 0, y: 0 });

    const handleMcqMouseDown = (e) => {
        if (e.button !== 0) return;
        setIsDraggingMcqCard(true);
        mcqDragOffsetRef.current = {
            x: e.clientX - mcqCardPos.x,
            y: e.clientY - mcqCardPos.y
        };
    };

    const handleMcqTouchStart = (e) => {
        if (e.touches && e.touches[0]) {
            setIsDraggingMcqCard(true);
            mcqDragOffsetRef.current = {
                x: e.touches[0].clientX - mcqCardPos.x,
                y: e.touches[0].clientY - mcqCardPos.y
            };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggingMcqCard) return;
            let newX = e.clientX - mcqDragOffsetRef.current.x;
            let newY = e.clientY - mcqDragOffsetRef.current.y;

            const maxRight = Math.max(10, window.innerWidth - 300);
            const maxBottom = Math.max(10, window.innerHeight - 80);
            newX = Math.max(10, Math.min(newX, maxRight));
            newY = Math.max(10, Math.min(newY, maxBottom));

            setMcqCardPos({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            if (isDraggingMcqCard) {
                setIsDraggingMcqCard(false);
            }
        };

        const handleTouchMove = (e) => {
            if (!isDraggingMcqCard || !e.touches || !e.touches[0]) return;
            let newX = e.touches[0].clientX - mcqDragOffsetRef.current.x;
            let newY = e.touches[0].clientY - mcqDragOffsetRef.current.y;

            const maxRight = Math.max(10, window.innerWidth - 300);
            const maxBottom = Math.max(10, window.innerHeight - 80);
            newX = Math.max(10, Math.min(newX, maxRight));
            newY = Math.max(10, Math.min(newY, maxBottom));

            setMcqCardPos({ x: newX, y: newY });
        };

        const handleTouchEnd = () => {
            if (isDraggingMcqCard) {
                setIsDraggingMcqCard(false);
            }
        };

        if (isDraggingMcqCard) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("touchend", handleTouchEnd);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isDraggingMcqCard]);

    const handleSelfVideoMouseDown = (e) => {
        setIsDraggingSelfVideo(true);
        dragOffsetRef.current = {
            x: e.clientX - selfVideoPos.x,
            y: e.clientY - selfVideoPos.y
        };
    };

    const handleSelfVideoTouchStart = (e) => {
        if (e.touches && e.touches[0]) {
            setIsDraggingSelfVideo(true);
            dragOffsetRef.current = {
                x: e.touches[0].clientX - selfVideoPos.x,
                y: e.touches[0].clientY - selfVideoPos.y
            };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggingSelfVideo) return;
            let newX = e.clientX - dragOffsetRef.current.x;
            let newY = e.clientY - dragOffsetRef.current.y;

            const maxRight = window.innerWidth - 180;
            const maxBottom = window.innerHeight - 120;
            newX = Math.max(10, Math.min(newX, maxRight));
            newY = Math.max(10, Math.min(newY, maxBottom));

            setSelfVideoPos({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            if (isDraggingSelfVideo) {
                setIsDraggingSelfVideo(false);
            }
        };

        const handleTouchMove = (e) => {
            if (!isDraggingSelfVideo || !e.touches || !e.touches[0]) return;
            let newX = e.touches[0].clientX - dragOffsetRef.current.x;
            let newY = e.touches[0].clientY - dragOffsetRef.current.y;

            const maxRight = window.innerWidth - 180;
            const maxBottom = window.innerHeight - 120;
            newX = Math.max(10, Math.min(newX, maxRight));
            newY = Math.max(10, Math.min(newY, maxBottom));

            setSelfVideoPos({ x: newX, y: newY });
        };

        const handleTouchEnd = () => {
            if (isDraggingSelfVideo) {
                setIsDraggingSelfVideo(false);
            }
        };

        if (isDraggingSelfVideo) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("touchend", handleTouchEnd);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isDraggingSelfVideo]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setInfoPopoverOpen(false);
            }
        };
        if (infoPopoverOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [infoPopoverOpen]);

    const { url } = useParams();
    const meetingCode = url || "demo";

    const getPermission = async () => {
        try {
            const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (userMediaStream) {
                setVideoAvailable(true);
                setAudioAvailable(true);

                userMediaStream.getAudioTracks().forEach(track => {
                    track.enabled = Boolean(audio);
                });
                userMediaStream.getVideoTracks().forEach(track => {
                    track.enabled = Boolean(video);
                });

                window.localStream = userMediaStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = userMediaStream;
                }
                for (let id in connectionsRef.current) {
                    addTracksToConnection(connectionsRef.current[id]);
                }
            }
        } catch (err) {
            console.log("Error getting audio & video permissions:", err);
            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setVideoAvailable(true);
                setAudioAvailable(false);

                videoStream.getVideoTracks().forEach(track => {
                    track.enabled = Boolean(video);
                });

                window.localStream = videoStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = videoStream;
                }
                for (let id in connectionsRef.current) {
                    addTracksToConnection(connectionsRef.current[id]);
                }
            } catch (err2) {
                console.log("Error getting video permission:", err2);
                setVideoAvailable(false);
                setAudioAvailable(false);
            }
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            setScreenAvailable(true);
        } else {
            setScreenAvailable(false);
        }
    };

    useEffect(() => {
        getPermission();
        
        return () => {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => {
                    try {
                        track.stop();
                    } catch (e) {}
                });
                window.localStream = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!askForUsername && video && localVideoRef.current && window.localStream) {
            if (localVideoRef.current.srcObject !== window.localStream) {
                localVideoRef.current.srcObject = window.localStream;
            }
            localVideoRef.current.play().catch(e => console.log("Local video play error:", e));
        }
    }, [askForUsername, video]);

    const addTracksToConnection = (peerConn) => {
        if (window.localStream && peerConn) {
            try {
                const senders = peerConn.getSenders ? peerConn.getSenders() : [];
                window.localStream.getTracks().forEach(track => {
                    const existingSender = senders.find(s => s.track && (s.track.id === track.id || s.track.kind === track.kind));
                    if (existingSender) {
                        existingSender.replaceTrack(track).catch(e => console.log("replaceTrack error:", e));
                    } else {
                        peerConn.addTrack(track, window.localStream);
                    }
                });
            } catch (e) {
                console.log("Error adding track to peer connection:", e);
            }
        }
    };

    let gotMessageFromServer = (fromId, message) => {
        let signal;
        try {
            signal = typeof message === 'string' ? JSON.parse(message) : message;
        } catch (err) {
            console.error("Invalid WebRTC signal format:", err);
            return;
        }
        if (!signal) return;

        if (fromId !== socketIdRef.current && connectionsRef.current[fromId]) {
            if (signal.sdp) {
                connectionsRef.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (iceCandidatesQueueRef.current[fromId]) {
                        iceCandidatesQueueRef.current[fromId].forEach(candidate => {
                            connectionsRef.current[fromId].addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.log(e));
                        });
                        iceCandidatesQueueRef.current[fromId] = [];
                    }

                    if (signal.sdp.type === "offer") {
                        connectionsRef.current[fromId].createAnswer().then((description) => {
                            connectionsRef.current[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({
                                    sdp: connectionsRef.current[fromId].localDescription
                                }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }

            if (signal.ice) {
                if (connectionsRef.current[fromId].remoteDescription && connectionsRef.current[fromId].remoteDescription.type) {
                    connectionsRef.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
                } else {
                    if (!iceCandidatesQueueRef.current[fromId]) {
                        iceCandidatesQueueRef.current[fromId] = [];
                    }
                    iceCandidatesQueueRef.current[fromId].push(signal.ice);
                }
            }
        }
    };

    useEffect(() => {
        if (showModal) {
            setNewMessages(0);
            if (chatEndRef.current) {
                chatEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [showModal, messages]);

    let addMessage = (data, sender, socketIdSender, timeString, recipient) => {
        const timestamp = timeString || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => [...prev, { data, sender, socketIdSender, timestamp, recipient: recipient || "everyone" }]);
        if (showModal) {
            setNewMessages(0);
        } else {
            setNewMessages((prev) => prev + 1);
        }
    };

    const fetchQuizRecords = async () => {
        try {
            if (getQuizRecordsApi) {
                const res = await getQuizRecordsApi(meetingCode);
                if (res) {
                    setQuizRecords(res);
                }
            }
        } catch (e) {
            console.error("Fetch quiz records error:", e);
        }
    };

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, {
            auth: {
                token: token || localStorage.getItem("token") || "",
                username: defaultUsername || username,
                role: userRole || "student"
            }
        });

        socketRef.current.on("socket-error", ({ message }) => {
            setSnackbarMsg(message || "You are not authorized to perform that action.");
            setOpenSnackbar(true);
        });

        socketRef.current.on("connect_error", (error) => {
            console.error("Socket connection failed:", error.message);
            setSnackbarMsg(error.message || "Unable to connect to the meeting server. Retrying...");
            setOpenSnackbar(true);

            if (error.message?.includes("Invalid or inactive token") || error.message?.includes("No token provided")) {
                socketRef.current.disconnect();
                localStorage.removeItem("token");
                localStorage.removeItem("currentUser");
                localStorage.removeItem("userRole");
                setTimeout(() => routeTo("/authentication"), 1200);
            }
        });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketIdRef.current = socketRef.current.id;
            socketRef.current.emit("join-call", meetingCode, {
                username: username || `User_${socketRef.current.id?.substring(0, 4)}`,
                role: userRole,
                profilePic: userData?.profilePic || null,
                mediaState: { video, audio }
            });

            socketRef.current.on("chat-message", addMessage);

            // Listener for peer media state changes (camera/mic toggles)
            socketRef.current.on("media-state-updated", ({ socketId, mediaState }) => {
                setPeerMediaStates(prev => ({
                    ...prev,
                    [socketId]: mediaState
                }));
            });

            // Host Media toggle
            socketRef.current.on("host-toggle-media", ({ type, state }) => {
                if (type === "audio") {
                    if (window.localStream) {
                        window.localStream.getAudioTracks().forEach(track => track.enabled = state);
                    }
                    setAudio(state);
                    if (socketRef.current) {
                        socketRef.current.emit("media-state-change", { video, audio: state });
                    }
                    setSnackbarMsg(`Trainer/Host ${state ? "unmuted" : "muted"} your microphone.`);
                    setOpenSnackbar(true);
                } else if (type === "video") {
                    if (window.localStream) {
                        window.localStream.getVideoTracks().forEach(track => track.enabled = state);
                    }
                    setVideo(state);
                    if (socketRef.current) {
                        socketRef.current.emit("media-state-change", { video: state, audio });
                    }
                    setSnackbarMsg(`Trainer/Host ${state ? "turned on" : "turned off"} your video camera.`);
                    setOpenSnackbar(true);
                }
            });

            // Listener for being removed/kicked from meeting by Host
            socketRef.current.on("kicked-from-call", ({ kickedBy, reason }) => {
                alert(`You have been removed from the meeting by ${kickedBy || 'the Host'}.`);
                try {
                    if (window.localStream) {
                        window.localStream.getTracks().forEach(track => track.stop());
                    }
                    for (let id in connectionsRef.current) {
                        connectionsRef.current[id].close();
                    }
                    if (socketRef.current) {
                        socketRef.current.disconnect();
                    }
                } catch (e) {}
                routeTo("/home");
            });

            // Listener for meeting ended by Host
            socketRef.current.on("meeting-ended", ({ reason }) => {
                alert(reason || "The host has ended the meeting.");
                try {
                    if (window.localStream) {
                        window.localStream.getTracks().forEach(track => track.stop());
                    }
                    for (let id in connectionsRef.current) {
                        connectionsRef.current[id].close();
                    }
                    if (socketRef.current) {
                        socketRef.current.disconnect();
                    }
                } catch (e) {}
                routeTo("/home");
            });

            // Camera permission request listener for Student
            socketRef.current.on("camera-permission-request", ({ hostId, hostName }) => {
                setCameraReqHostId(hostId);
                setCameraReqHostName(hostName);
                setCameraReqDialogOpen(true);
            });

            // Camera permission response listener for Trainer
            socketRef.current.on("camera-permission-response", ({ allowed, studentName }) => {
                setSnackbarMsg(`${studentName || 'Student'} ${allowed ? 'allowed' : 'declined'} camera request.`);
                setOpenSnackbar(true);
            });

            // Media permission updated listener
            socketRef.current.on("media-permission-updated", ({ canPublishAudio, canPublishVideo, updatedBy }) => {
                if (typeof canPublishAudio === 'boolean') {
                    if (window.localStream) {
                        window.localStream.getAudioTracks().forEach(track => track.enabled = canPublishAudio);
                    }
                    setAudio(canPublishAudio);
                }
                if (typeof canPublishVideo === 'boolean') {
                    if (window.localStream) {
                        window.localStream.getVideoTracks().forEach(track => track.enabled = canPublishVideo);
                    }
                    setVideo(canPublishVideo);
                }
                setSnackbarMsg("Media permission updated by Trainer/Admin.");
                setOpenSnackbar(true);
            });

            // Receive instant grade listener
            socketRef.current.on("receive_grade", (gradeData) => {
                setQuizFeedback({
                    submitted: true,
                    isCorrect: gradeData.isCorrect,
                    correctOptionIndex: gradeData.correctOptionIndex,
                    scoreEarned: gradeData.scoreEarned
                });

                setStudentScoreHistory((prev) => [
                    ...prev,
                    {
                        quizId: activeMcq?.id || `quiz_${Date.now()}`,
                        questionText: activeMcq?.question || "Live Classroom Question",
                        isCorrect: gradeData.isCorrect,
                        scoreEarned: gradeData.scoreEarned || (gradeData.isCorrect ? 1 : 0),
                        submittedAt: new Date().toLocaleTimeString()
                    }
                ]);

                setSnackbarMsg(gradeData.isCorrect ? `Correct! +${gradeData.scoreEarned || 1} pts` : "Incorrect answer!");
                setOpenSnackbar(true);

                // Automatically close question within 3 seconds after submission
                setTimeout(() => {
                    setActiveMcq(null);
                    setQuizFeedback(null);
                    setStudentSelectedOption(null);
                }, 3000);
            });

            // MCQ Quiz listeners
            socketRef.current.on("new-mcq", (quizData) => {
                setActiveMcq(quizData);
                setStudentSelectedOption(null);
                setQuizFeedback(null);
                setSnackbarMsg("Live MCQ Quiz launched by Trainer!");
                setOpenSnackbar(true);
            });

            socketRef.current.on("mcq-answer-recorded", (data) => {
                fetchQuizRecords();
            });

            socketRef.current.on("analytics-update", (data) => {
                setMcqAnalytics(data);
            });

            socketRef.current.on("user-left", (id) => {
                if (connectionsRef.current[id]) {
                    delete connectionsRef.current[id];
                }
                if (iceCandidatesQueueRef.current[id]) {
                    delete iceCandidatesQueueRef.current[id];
                }
                setVideos((videos) => videos.filter((v) => v.socketId !== id));
                setRoomParticipants((prev) => prev.filter(p => p.socketId !== id));
            });

            socketRef.current.on("user-joined", (id, clients, currentHostId, userMeta, allUsers) => {
                if (currentHostId) {
                    setHostId(currentHostId);
                    setIsHost(currentHostId === socketIdRef.current);
                }
                if (allUsers && Array.isArray(allUsers)) {
                    setRoomParticipants(allUsers);
                    const initialStates = {};
                    allUsers.forEach(u => {
                        if (u.socketId && u.mediaState) {
                            initialStates[u.socketId] = u.mediaState;
                        }
                    });
                    setPeerMediaStates(prev => ({ ...prev, ...initialStates }));
                } else if (userMeta) {
                    setRoomParticipants((prev) => [
                        ...prev.filter(p => p.socketId !== id),
                        { socketId: id, username: userMeta.username || `User_${id.substring(0, 4)}`, role: userMeta.role || "student", profilePic: userMeta.profilePic, mediaState: userMeta.mediaState }
                    ]);
                    if (userMeta.mediaState) {
                        setPeerMediaStates(prev => ({ ...prev, [id]: userMeta.mediaState }));
                    }
                }

                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return;

                    if (!connectionsRef.current[socketListId]) {
                        connectionsRef.current[socketListId] = new RTCPeerConnection(peerConfigConnections);

                        connectionsRef.current[socketListId].onicecandidate = (event) => {
                            if (event.candidate != null) {
                                socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                            }
                        };

                        const handleRemoteStream = (incomingStream, track) => {
                            setVideos(prevVideos => {
                                const videoExists = prevVideos.find(v => v.socketId === socketListId);
                                if (videoExists) {
                                    const currentStream = videoExists.stream || new MediaStream();
                                    if (incomingStream) {
                                        incomingStream.getTracks().forEach(t => {
                                            if (!currentStream.getTracks().some(existing => existing.id === t.id)) {
                                                currentStream.addTrack(t);
                                            }
                                        });
                                    }
                                    if (track && !currentStream.getTracks().some(existing => existing.id === track.id)) {
                                        currentStream.addTrack(track);
                                    }
                                    const updated = prevVideos.map(v => v.socketId === socketListId ? { ...v, stream: currentStream, lastUpdated: Date.now() } : v);
                                    videoRef.current = updated;
                                    return updated;
                                } else {
                                    let newStream = incomingStream || new MediaStream();
                                    if (track && !newStream.getTracks().some(existing => existing.id === track.id)) {
                                        newStream.addTrack(track);
                                    }
                                    const updated = [...prevVideos, { socketId: socketListId, stream: newStream, autoPlay: true, playsInline: true, lastUpdated: Date.now() }];
                                    videoRef.current = updated;
                                    return updated;
                                }
                            });
                        };

                        connectionsRef.current[socketListId].ontrack = (event) => {
                            const stream = (event.streams && event.streams[0]) ? event.streams[0] : null;
                            handleRemoteStream(stream, event.track);
                        };

                        connectionsRef.current[socketListId].onaddstream = (event) => {
                            handleRemoteStream(event.stream, null);
                        };

                        addTracksToConnection(connectionsRef.current[socketListId]);
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connectionsRef.current) {
                        if (id2 === socketIdRef.current) continue;

                        connectionsRef.current[id2].createOffer().then((description) => {
                            connectionsRef.current[id2].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connectionsRef.current[id2].localDescription }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }
            });
        });
    };

    let getMedia = () => {
        connectToSocketServer();
    };

    let routeTo = useNavigate();

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    };

    let handleVideo = () => {
        const nextVideo = !video;
        if (window.localStream) {
            window.localStream.getVideoTracks().forEach(track => {
                track.enabled = nextVideo;
            });
        }
        setVideo(nextVideo);
        if (socketRef.current) {
            socketRef.current.emit("media-state-change", { video: nextVideo, audio });
        }
    };

    let stopScreenShare = () => {
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {
                    console.log("Track stop error:", e);
                }
            });
            window.localStream = null;
        }
        setScreen(false);
        getPermission();
    };

    let handleAudio = () => {
        const nextAudio = !audio;
        if (window.localStream) {
            window.localStream.getAudioTracks().forEach(track => {
                track.enabled = nextAudio;
            });
        }
        setAudio(nextAudio);
        if (socketRef.current) {
            socketRef.current.emit("media-state-change", { video, audio: nextAudio });
        }
    };

    let getDisplayMediaSucess = (stream) => {
        // Bug 1 Fix: Strictly enforce global user audio state on all captured screen share audio tracks (system audio)
        stream.getAudioTracks().forEach(track => {
            track.enabled = Boolean(audio);
        });

        // Preserve & sync microphone audio track if previous stream had it
        if (window.localStream) {
            const micAudioTracks = window.localStream.getAudioTracks();
            micAudioTracks.forEach(micTrack => {
                micTrack.enabled = Boolean(audio);
                if (!stream.getAudioTracks().some(t => t.id === micTrack.id)) {
                    stream.addTrack(micTrack);
                }
            });
        }

        window.localStream = stream;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        const videoTrack = stream.getVideoTracks()[0];

        // Replace tracks on all active WebRTC peer connections
        for (let id in connectionsRef.current) {
            if (id === socketIdRef.current) continue;
            addTracksToConnection(connectionsRef.current[id]);
        }

        if (videoTrack) {
            videoTrack.onended = () => {
                stopScreenShare();
            };
        }
    };

    useEffect(() => {
        let getDisplayMedia = () => {
            if (screen) {
                if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                        .then(getDisplayMediaSucess)
                        .catch((e) => {
                            console.log("getDisplayMedia error:", e);
                            setScreen(false);
                        });
                }
            }
        };

        if (screen !== undefined && screen !== false) {
            getDisplayMedia();
        }
    }, [screen]);

    const handleFullscreen = (elementId) => {
        const elem = document.getElementById(elementId);
        if (elem) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        }
    };

    let handleScreen = () => {
        // Bug 2 Fix: If already sharing, explicitly stop all tracks and revert to camera stream
        if (screen) {
            stopScreenShare();
        } else {
            setScreen(true);
        }
    };

    let sendMessage = () => {
        if (!message || !message.trim()) return;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (socketRef.current) {
            socketRef.current.emit("chat-message", message.trim(), username || "User", chatRecipient, timestamp);
        }
        setMessage("");
        setTimeout(() => {
            if (chatInputRef.current) {
                chatInputRef.current.focus();
            }
        }, 0);
    };

    let handleEndCall = () => {
        if (autoLeaveTimerRef.current) {
            clearTimeout(autoLeaveTimerRef.current);
            autoLeaveTimerRef.current = null;
        }

        if (socketRef.current && socketIdRef.current === activeHostId) {
            socketRef.current.emit("end-meeting");
            // The disconnect cleanup will happen below.
        }

        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
            for (let id in connectionsRef.current) {
                connectionsRef.current[id].close();
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        } catch (e) { }

        routeTo("/home");
    };

    // Auto-leave meeting after 5 minutes if no other participants exist in the room
    useEffect(() => {
        if (!askForUsername && socketIdRef.current) {
            const otherParticipants = roomParticipants.filter(p => p.socketId && p.socketId !== socketIdRef.current);
            const isAlone = otherParticipants.length === 0 && videos.length === 0;

            if (isAlone) {
                if (!autoLeaveTimerRef.current) {
                    setSnackbarMsg("No other participants in meeting. Auto-leaving in 5 minutes if no one joins.");
                    setOpenSnackbar(true);

                    autoLeaveTimerRef.current = setTimeout(() => {
                        alert("Auto-leaving meeting: No other participants were present for 5 minutes.");
                        handleEndCall();
                    }, 5 * 60 * 1000); // 5 minutes (300,000 ms)
                }
            } else {
                if (autoLeaveTimerRef.current) {
                    clearTimeout(autoLeaveTimerRef.current);
                    autoLeaveTimerRef.current = null;
                    setSnackbarMsg("Participant joined. Auto-leave timer cancelled.");
                    setOpenSnackbar(true);
                }
            }
        }

        return () => {
            if (autoLeaveTimerRef.current) {
                clearTimeout(autoLeaveTimerRef.current);
                autoLeaveTimerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [askForUsername, roomParticipants, videos]);

    const handleRemoveParticipant = (targetSocketId, targetUsername) => {
        if (!socketRef.current) return;
        socketRef.current.emit("remove-participant", {
            targetSocketId,
            targetUsername: targetUsername || "Participant"
        });
        setSnackbarMsg(`Removed ${targetUsername || 'Participant'} from the meeting.`);
        setOpenSnackbar(true);
    };

    const handleRequestStudentCamera = (targetSocketId) => {
        if (!socketRef.current) return;
        socketRef.current.emit("request-camera-permission", {
            targetId: targetSocketId,
            hostName: username || (userRole === 'trainer' ? 'Trainer' : 'Host')
        });
        setSnackbarMsg("Sent camera permission request to student.");
        setOpenSnackbar(true);
    };

    const handleCameraReqResponse = (allowed) => {
        setCameraReqDialogOpen(false);
        if (socketRef.current) {
            socketRef.current.emit("camera-permission-response", {
                hostId: cameraReqHostId,
                allowed: allowed,
                studentName: username || "Student"
            });
        }
        if (allowed) {
            if (!video) {
                handleVideo();
            }
            setSnackbarMsg("Camera enabled per Trainer request.");
        } else {
            setSnackbarMsg("Declined Trainer camera request.");
        }
        setOpenSnackbar(true);
    };

    const handleLaunchNewQuiz = async () => {
        if (!mcqQuestion.trim() || mcqOptions.some(o => !o.trim())) {
            setSnackbarMsg("Please provide a question and all 4 options.");
            setOpenSnackbar(true);
            return;
        }

        let quizId = `quiz_${Date.now()}`;

        // Attempt persistence via API gracefully
        try {
            if (createQuizApi) {
                const res = await createQuizApi({
                    meetingId: meetingCode,
                    question: mcqQuestion,
                    options: mcqOptions,
                    correctOptionIndex: Number(mcqCorrectIndex),
                    creatorId: username || "Trainer"
                });
                if (res?.quiz?.id || res?.quiz?._id) {
                    quizId = res.quiz.id || res.quiz._id;
                }
            }
        } catch (apiErr) {
            console.warn("[handleLaunchNewQuiz] API persistence notice (using real-time memory engine):", apiErr);
        }

        // Guaranteed real-time Socket.IO launch to all students
        try {
            const quizData = {
                id: quizId,
                question: mcqQuestion,
                options: mcqOptions,
                correctOptionIndex: Number(mcqCorrectIndex)
            };

            setActiveMcq(quizData);
            if (socketRef.current) {
                socketRef.current.emit("launch-mcq", quizData);
            }

            setMcqModalOpen(false);
            setSnackbarMsg("Live MCQ Quiz launched to all students!");
            setOpenSnackbar(true);
            if (typeof fetchQuizRecords === "function") {
                fetchQuizRecords();
            }
        } catch (err) {
            console.error(err);
            setSnackbarMsg("Failed to create quiz.");
            setOpenSnackbar(true);
        }
    };

    const handleSubmitStudentAnswer = async () => {
        if (studentSelectedOption === null || !activeMcq) return;

        try {
            // Indicate submission pending
            setQuizFeedback({ submitted: true, pending: true });

            // Emit raw answer to backend server for validation (Zero answer key on client)
            if (socketRef.current) {
                socketRef.current.emit("submit-mcq-answer", {
                    quizId: activeMcq.id,
                    meetingId: meetingCode,
                    studentUsername: username || "Student",
                    studentName: username || "Student",
                    selectedOptionIndex: studentSelectedOption,
                    latencyMs: Date.now() - new Date(activeMcq.pushedAt || Date.now()).getTime()
                });
            }
        } catch (err) {
            console.error(err);
            setSnackbarMsg("Failed to submit answer.");
            setOpenSnackbar(true);
        }
    };

    const copyMeetingLink = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    setSnackbarMsg("Meeting link copied to clipboard!");
                    setOpenSnackbar(true);
                })
                .catch(() => {
                    setSnackbarMsg("Meeting URL: " + window.location.href);
                    setOpenSnackbar(true);
                });
        } else {
            setSnackbarMsg("Meeting URL: " + window.location.href);
            setOpenSnackbar(true);
        }
    };

    useEffect(() => {
        const currentConnections = connectionsRef.current;
        const currentSocket = socketRef.current;

        return () => {
            for (let id in currentConnections) {
                try {
                    currentConnections[id].close();
                } catch (e) {}
                delete currentConnections[id];
            }
            if (currentSocket) {
                currentSocket.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (!activeMcq) return;

        let initialLimit = activeMcq.timeLimitSeconds || 30;
        if (activeMcq.expiresAt) {
            const diff = Math.max(0, Math.ceil((new Date(activeMcq.expiresAt).getTime() - Date.now()) / 1000));
            initialLimit = diff;
        }

        if (initialLimit <= 0) {
            setActiveMcq(null);
            setQuizFeedback(null);
            setStudentSelectedOption(null);
            return;
        }

        setMcqTimeLeft(initialLimit);

        let timeoutId;
        const interval = setInterval(() => {
            setMcqTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setSnackbarMsg("Time is up! MCQ closed.");
                    setOpenSnackbar(true);
                    timeoutId = setTimeout(() => {
                        setActiveMcq(null);
                        setQuizFeedback(null);
                        setStudentSelectedOption(null);
                    }, 2000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [activeMcq]);

    const isTrainerOrAdmin = userRole === 'trainer' || userRole === 'admin' || isHost;
    const otherParticipants = roomParticipants.filter(p => p.socketId !== socketIdRef.current);
        const isLocalVideoMainStage = videos.length === 0 || screen === true;

    const LocalVideoContent = (
        <>
            {video ? (
                <video
                    ref={(ref) => {
                        localVideoRef.current = ref;
                        if (ref && window.localStream) {
                            if (ref.srcObject !== window.localStream) {
                                ref.srcObject = window.localStream;
                            }
                            ref.play().catch((err) => console.log('Local video play error:', err));
                        }
                    }}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                ></video>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                    <Avatar 
                        src={userData?.profilePic || ''} 
                        sx={{ 
                            width: isLocalVideoMainStage ? 120 : 44, 
                            height: isLocalVideoMainStage ? 120 : 44, 
                            bgcolor: 'rgba(255,255,255,0.1)', 
                            border: '2px solid rgba(255,255,255,0.25)'
                        }}
                    >
                        <PersonIcon sx={{ fontSize: isLocalVideoMainStage ? 80 : 30, color: '#94a3b8' }} />
                    </Avatar>
                </div>
            )}

            {/* Self Frame Status Icons */}
            <div style={{
                position: 'absolute',
                top: isLocalVideoMainStage ? '10px' : '6px',
                right: isLocalVideoMainStage ? '10px' : '6px',
                display: 'flex',
                gap: '4px',
                zIndex: 5
            }}>
                {!video && (
                    <Tooltip title='Camera Off'>
                        <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.9)', borderRadius: '50%', p: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <VideocamOffIcon sx={{ fontSize: 13, color: '#ffffff' }} />
                        </Box>
                    </Tooltip>
                )}
                {!audio ? (
                    <Tooltip title='Microphone Muted'>
                        <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.9)', borderRadius: '50%', p: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MicOffIcon sx={{ fontSize: 13, color: '#ffffff' }} />
                        </Box>
                    </Tooltip>
                ) : (
                    <Tooltip title='Microphone Active'>
                        <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.9)', borderRadius: '50%', p: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MicIcon sx={{ fontSize: 13, color: '#ffffff' }} />
                        </Box>
                    </Tooltip>
                )}
            </div>

            {/* Fullscreen Button for Self */}
            <div style={{
                position: 'absolute',
                bottom: isLocalVideoMainStage ? '10px' : '4px',
                right: isLocalVideoMainStage ? '10px' : '6px',
                zIndex: 5
            }}>
                <Tooltip title='Full Screen'>
                    <IconButton size='small' onClick={() => handleFullscreen('video-wrapper-self')} sx={{ color: '#ffffff', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                        <FullscreenIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
            </div>

            {/* Self Name Banner */}
            <div style={{
                position: 'absolute',
                bottom: isLocalVideoMainStage ? '10px' : '4px',
                left: isLocalVideoMainStage ? '10px' : '6px',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                padding: '2px 8px',
                borderRadius: '4px',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                <Typography variant='caption' sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    You ({username || 'Self'})
                </Typography>
            </div>
        </>
    );

    const totalParticipantsCount = Math.max(1 + otherParticipants.length, videos.length + 1);

    return (
        <div>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="info" sx={{ width: '100%' }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>

            {askForUsername === true ?
                <div className={styles.lobbyContainer}>
                    <div className={styles.lobbyCard}>
                        <h2>Join Learning Room</h2>
                        <Chip
                            label={`Role: ${userRole.toUpperCase()}`}
                            color={userRole === 'trainer' || userRole === 'admin' ? "secondary" : "primary"}
                            sx={{ fontWeight: 'bold' }}
                        />
                        <div className={styles.lobbyVideoPreview} style={{ position: 'relative', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {video ? (
                                <video 
                                    ref={(ref) => {
                                        localVideoRef.current = ref;
                                        if (ref && window.localStream) {
                                            if (ref.srcObject !== window.localStream) {
                                                ref.srcObject = window.localStream;
                                            }
                                            ref.play().catch(err => console.log("Lobby video play error:", err));
                                        }
                                    }} 
                                    autoPlay 
                                    muted 
                                    playsInline 
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                ></video>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", height: "100%" }}>
                                    <Avatar 
                                        src={userData?.profilePic || ""} 
                                        sx={{ width: 64, height: 64, bgcolor: "#0e71eb", fontSize: "1.6rem", fontWeight: "bold", border: "3px solid rgba(255,255,255,0.2)" }}
                                    >
                                        {(username || "You")[0]?.toUpperCase()}
                                    </Avatar>
                                    <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                                        Camera Off
                                    </Typography>
                                </div>
                            )}

                            {/* Top Right Media Status Pills */}
                            <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px", zIndex: 10 }}>
                                <Chip
                                    size="small"
                                    icon={audio ? <MicIcon style={{ color: "#ffffff", fontSize: 14 }} /> : <MicOffIcon style={{ color: "#ffffff", fontSize: 14 }} />}
                                    label={audio ? "Mic On" : "Muted"}
                                    sx={{
                                        bgcolor: audio ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)",
                                        color: "#ffffff",
                                        fontWeight: 700,
                                        fontSize: "11px",
                                        height: "24px"
                                    }}
                                />
                                <Chip
                                    size="small"
                                    icon={video ? <VideocamIcon style={{ color: "#ffffff", fontSize: 14 }} /> : <VideocamOffIcon style={{ color: "#ffffff", fontSize: 14 }} />}
                                    label={video ? "Cam On" : "Cam Off"}
                                    sx={{
                                        bgcolor: video ? "rgba(14, 113, 235, 0.9)" : "rgba(239, 68, 68, 0.9)",
                                        color: "#ffffff",
                                        fontWeight: 700,
                                        fontSize: "11px",
                                        height: "24px"
                                    }}
                                />
                            </div>

                            {/* Bottom Center Floating Quick Toggle Action Bar */}
                            <div style={{
                                position: "absolute",
                                bottom: "12px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                background: "rgba(0, 0, 0, 0.65)",
                                backdropFilter: "blur(8px)",
                                padding: "6px 14px",
                                borderRadius: "24px",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                zIndex: 10
                            }}>
                                <Tooltip title={audio ? "Mute Microphone" : "Unmute Microphone"}>
                                    <IconButton
                                        onClick={handleAudio}
                                        size="small"
                                        sx={{
                                            color: "#ffffff",
                                            bgcolor: audio ? "#10b981" : "#ef4444",
                                            "&:hover": { bgcolor: audio ? "#059669" : "#dc2626" },
                                            width: 36,
                                            height: 36
                                        }}
                                    >
                                        {audio ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={video ? "Turn Camera Off" : "Turn Camera On"}>
                                    <IconButton
                                        onClick={handleVideo}
                                        size="small"
                                        sx={{
                                            color: "#ffffff",
                                            bgcolor: video ? "#0e71eb" : "#ef4444",
                                            "&:hover": { bgcolor: video ? "#005ce6" : "#dc2626" },
                                            width: 36,
                                            height: 36
                                        }}
                                    >
                                        {video ? <VideocamIcon fontSize="small" /> : <VideocamOffIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                        <div className={styles.lobbyForm}>
                            <TextField 
                                id="outlined-basic" 
                                label={isAuthenticated ? "Authenticated Account Name" : "Username / Display Name"} 
                                value={username} 
                                onChange={e => {
                                    if (!isAuthenticated) {
                                        setUsername(e.target.value);
                                    }
                                }} 
                                disabled={isAuthenticated}
                                variant="outlined" 
                                fullWidth
                                helperText={isAuthenticated ? "🔒 Display name is locked to your account profile. Change it in Profile Settings." : ""}
                                slotProps={{
                                    input: {
                                        readOnly: isAuthenticated,
                                        startAdornment: isAuthenticated ? (
                                            <InputAdornment position="start">
                                                <LockIcon fontSize="small" sx={{ color: '#0e71eb' }} />
                                            </InputAdornment>
                                        ) : null
                                    }
                                }}
                            />
                            <Button 
                                variant="contained" 
                                size="large" 
                                onClick={connect} 
                                fullWidth 
                                style={{ backgroundColor: "#2b73e0", padding: "12px", fontWeight: "bold", borderRadius: "8px" }}
                            >
                                Enter Class Session
                            </Button>
                            <Button 
                                variant="outlined" 
                                startIcon={<ContentCopyIcon />}
                                onClick={copyMeetingLink}
                                fullWidth
                                style={{ borderRadius: "8px", textTransform: "none", fontWeight: "600" }}
                            >
                                Copy Session Link
                            </Button>
                        </div>
                    </div>
                </div> :

                <div className={styles.meetVideoContainer}>
                    {/* Top-Left Zoom-like Compact Security Shield Trigger */}
                    <div ref={popoverRef} className={styles.topInfoContainer}>
                        <Tooltip title="Meeting Info & Security Details" placement="right">
                            <IconButton
                                onClick={() => setInfoPopoverOpen(!infoPopoverOpen)}
                                className={styles.infoShieldButton}
                                sx={{
                                    bgcolor: infoPopoverOpen ? "rgba(16, 185, 129, 0.25)" : "rgba(30, 41, 59, 0.75)",
                                    color: "#10b981",
                                    backdropFilter: "blur(8px)",
                                    border: "1px solid rgba(16, 185, 129, 0.4)",
                                    padding: "8px",
                                    transition: "all 0.2s ease-in-out",
                                    opacity: 0.85,
                                    "&:hover": {
                                        opacity: 1,
                                        bgcolor: "rgba(16, 185, 129, 0.3)",
                                        transform: "scale(1.05)",
                                        boxShadow: "0 0 12px rgba(16, 185, 129, 0.4)"
                                    }
                                }}
                            >
                                <VerifiedUserIcon sx={{ fontSize: 22 }} />
                            </IconButton>
                        </Tooltip>

                        {/* Floating Overlay Popover Card */}
                        {infoPopoverOpen && (
                            <Paper
                                elevation={12}
                                className={styles.infoPopoverCard}
                                sx={{
                                    position: "absolute",
                                    top: "48px",
                                    left: "0px",
                                    width: "320px",
                                    maxWidth: "90vw",
                                    bgcolor: "#1e1e1e",
                                    color: "#ffffff",
                                    borderRadius: "14px",
                                    border: "1px solid #334155",
                                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
                                    p: 2.5,
                                    zIndex: 100,
                                    backdropFilter: "blur(16px)"
                                }}
                            >
                                {/* Header: Security Tag & Role Badge */}
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, pb: 1.5, borderBottom: "1px solid #334155" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <LockIcon sx={{ color: "#10b981", fontSize: 18 }} />
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#10b981", letterSpacing: 0.3 }}>
                                            End-to-End Encrypted
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={userRole === 'trainer' || userRole === 'admin' ? <SchoolIcon style={{ fontSize: 14, color: '#fff' }} /> : undefined}
                                        label={userRole.toUpperCase()}
                                        size="small"
                                        color={userRole === 'trainer' || userRole === 'admin' ? "secondary" : "primary"}
                                        sx={{ fontWeight: 800, fontSize: "0.7rem", height: "22px" }}
                                    />
                                </Box>

                                {/* Middle: Session ID Input & Copy Button */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.5, fontWeight: 600 }}>
                                        MEETING SESSION ID
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#121212", p: 1.2, borderRadius: "8px", border: "1px solid #334155" }}>
                                        <Typography variant="body2" fontWeight="bold" sx={{ color: "#ffffff", fontFamily: "monospace", fontSize: "0.95rem" }}>
                                            {meetingCode}
                                        </Typography>
                                        <Tooltip title={copiedIdTooltip ? "Copied!" : "Copy Link & ID"}>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    copyMeetingLink();
                                                    setCopiedIdTooltip(true);
                                                    setTimeout(() => setCopiedIdTooltip(false), 2000);
                                                }}
                                                sx={{ color: copiedIdTooltip ? "#10b981" : "#0e71eb", p: 0.5 }}
                                            >
                                                {copiedIdTooltip ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                {/* Footer Metadata: 2-Column Key-Value Grid */}
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, bgcolor: "#121212", p: 1.5, borderRadius: "10px", border: "1px solid #334155" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>Account Role</Typography>
                                        <Typography variant="caption" fontWeight="bold" sx={{ color: "#ffffff" }}>
                                            {isHost ? "Host / Trainer" : "Student Participant"}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>Security Protocol</Typography>
                                        <Typography variant="caption" fontWeight="bold" sx={{ color: "#ffffff" }}>
                                            WebRTC STUN/ICE
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>Live Status</Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                                            <Typography variant="caption" fontWeight="bold" sx={{ color: "#10b981" }}>
                                                {isTrainerOrAdmin ? "Controls Active" : "Session Active"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        )}
                    </div>

                    {/* Sleek Docked Right Classroom Chat Sidebar */}
                    {showModal && (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                {/* Header Bar */}
                                <div className={styles.chatHeaderBar}>
                                    <div className={styles.chatHeaderTitle}>
                                        <ChatIcon sx={{ color: "#0e71eb", fontSize: 22 }} />
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#ffffff" }}>
                                            In-Meeting Chat
                                        </Typography>
                                    </div>
                                    <IconButton
                                        size="small"
                                        onClick={() => setModal(false)}
                                        sx={{ color: "#94a3b8", "&:hover": { color: "#ffffff", bgcolor: "rgba(255, 255, 255, 0.1)" } }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </div>

                                {/* Message Stream */}
                                <div className={styles.chattingDisplay}>
                                    {messages.length > 0 ? (
                                        messages.map((item, index) => {
                                            const isSelf = item.socketIdSender === socketIdRef.current || item.sender === (username || "You");
                                            return (
                                                <div
                                                    key={index}
                                                    className={`${styles.chatMessage} ${isSelf ? styles.chatMessageSelf : ""}`}
                                                >
                                                    <div className={styles.chatSenderRow}>
                                                        <span className={`${styles.chatSender} ${isSelf ? styles.chatSenderSelf : ""}`}>
                                                            {isSelf ? "You" : item.sender}
                                                            {item.recipient && item.recipient !== "everyone" && (
                                                                <span style={{ fontSize: "0.7rem", color: "#f59e0b", marginLeft: "6px", fontWeight: "normal" }}>
                                                                    (To {item.recipient === "host" ? "Host" : item.recipient})
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className={styles.chatTime}>
                                                            {item.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className={styles.chatData}>{item.data}</p>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <Box sx={{ textAlign: "center", py: 6, px: 2, color: "#64748b" }}>
                                            <ChatIcon sx={{ fontSize: 40, opacity: 0.4, mb: 1 }} />
                                            <Typography variant="body2">
                                                No messages yet. Send a message to start the classroom conversation!
                                            </Typography>
                                        </Box>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Docked Bottom Input Area */}
                                <div className={styles.chattingAreaDocked}>
                                    <div className={styles.chatRecipientBar}>
                                        <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                                            To:
                                        </Typography>
                                        <Select
                                            value={chatRecipient}
                                            onChange={(e) => setChatRecipient(e.target.value)}
                                            size="small"
                                            variant="standard"
                                            disableUnderline
                                            sx={{
                                                color: "#38bdf8",
                                                fontWeight: "bold",
                                                fontSize: "0.8rem",
                                                ".MuiSelect-icon": { color: "#38bdf8" }
                                            }}
                                        >
                                            <MenuItem value="everyone">Everyone</MenuItem>
                                            <MenuItem value="host">Host / Trainer Only</MenuItem>
                                        </Select>
                                    </div>

                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <TextField
                                            inputRef={chatInputRef}
                                            multiline
                                            maxRows={3}
                                            size="small"
                                            fullWidth
                                            placeholder="Type message here..."
                                            value={message || ""}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            sx={{
                                                bgcolor: "#2c2c2e",
                                                borderRadius: "10px",
                                                "& .MuiOutlinedInput-root": {
                                                    color: "#ffffff",
                                                    fontSize: "0.9rem",
                                                    "& fieldset": { borderColor: "#3a3a3e" },
                                                    "&:hover fieldset": { borderColor: "#0e71eb" },
                                                    "&.Mui-focused fieldset": { borderColor: "#0e71eb" }
                                                }
                                            }}
                                        />
                                        <IconButton
                                            onClick={sendMessage}
                                            disabled={!message || !message.trim()}
                                            sx={{
                                                bgcolor: message && message.trim() ? "#0e71eb" : "#2c2c2e",
                                                color: message && message.trim() ? "#ffffff" : "#64748b",
                                                borderRadius: "10px",
                                                p: 1.2,
                                                transition: "all 0.2s ease-in-out",
                                                "&:hover": {
                                                    bgcolor: message && message.trim() ? "#0b5ed7" : "#2c2c2e"
                                                },
                                                "&.Mui-disabled": {
                                                    bgcolor: "#242426",
                                                    color: "#475569",
                                                    opacity: 0.6
                                                }
                                            }}
                                        >
                                            <SendIcon sx={{ fontSize: 20 }} />
                                        </IconButton>
                                    </Box>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Floating Action Bar */}
                    <div className={`${styles.buttonContainers} ${showModal ? styles.buttonContainersShifted : ''}`}>
                        {/* Group 1: Media Controls */}
                        <Tooltip title={audio ? "Mute Microphone" : "Unmute Microphone"}>
                            <IconButton 
                                onClick={handleAudio} 
                                sx={{ color: audio ? "#ffffff" : "#ef4444", bgcolor: audio ? "rgba(255, 255, 255, 0.1)" : "rgba(239, 68, 68, 0.2)", "&:hover": { bgcolor: audio ? "rgba(255, 255, 255, 0.2)" : "rgba(239, 68, 68, 0.3)" } }}
                            >
                                {audio ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={video ? "Turn Camera Off" : "Turn Camera On"}>
                            <IconButton 
                                onClick={handleVideo} 
                                sx={{ color: video ? "#ffffff" : "#ef4444", bgcolor: video ? "rgba(255, 255, 255, 0.1)" : "rgba(239, 68, 68, 0.2)", "&:hover": { bgcolor: video ? "rgba(255, 255, 255, 0.2)" : "rgba(239, 68, 68, 0.3)" } }}
                            >
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255, 255, 255, 0.15)", mx: 0.5 }} />

                        {/* Group 2: Screen Share & Features */}
                        {screenAvailable && (
                            <Tooltip title={screen ? "Stop Screen Share" : "Share Screen"}>
                                <IconButton 
                                    onClick={handleScreen} 
                                    sx={{ color: screen ? "#10b981" : "#ffffff", bgcolor: screen ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.1)", "&:hover": { bgcolor: screen ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.2)" } }}
                                >
                                    {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title="Classroom Chat">
                            <Badge badgeContent={newMessages} max={99} color="error">
                                <IconButton 
                                    onClick={() => { 
                                        const nextModalState = !showModal;
                                        setModal(nextModalState); 
                                        if (nextModalState) {
                                            setNewMessages(0);
                                        }
                                    }} 
                                    sx={{ color: showModal ? "#0e71eb" : "#ffffff", bgcolor: showModal ? "rgba(14, 113, 235, 0.2)" : "rgba(255, 255, 255, 0.1)", "&:hover": { bgcolor: showModal ? "rgba(14, 113, 235, 0.3)" : "rgba(255, 255, 255, 0.2)" } }}
                                >
                                    <ChatIcon />
                                </IconButton>
                            </Badge>
                        </Tooltip>

                        {/* Participants List Toggle */}
                        <Tooltip title={`Participants List (${totalParticipantsCount})`}>
                            <Badge badgeContent={totalParticipantsCount} color="primary">
                                <IconButton
                                    onClick={() => setParticipantsModalOpen(true)}
                                    sx={{
                                        color: participantsModalOpen ? "#0e71eb" : "#ffffff",
                                        bgcolor: participantsModalOpen ? "rgba(14, 113, 235, 0.2)" : "rgba(255, 255, 255, 0.1)",
                                        "&:hover": { bgcolor: participantsModalOpen ? "rgba(14, 113, 235, 0.3)" : "rgba(255, 255, 255, 0.2)" }
                                    }}
                                >
                                    <GroupIcon />
                                </IconButton>
                            </Badge>
                        </Tooltip>

                        {/* MCQ Quiz Buttons */}
                        {isTrainerOrAdmin ? (
                            <>
                                <Tooltip title="Create & Launch Live MCQ Quiz">
                                    <IconButton 
                                        onClick={() => setMcqModalOpen(true)} 
                                        sx={{ color: "#38bdf8", bgcolor: "rgba(56, 189, 248, 0.15)", "&:hover": { bgcolor: "rgba(56, 189, 248, 0.25)" } }}
                                    >
                                        <QuizIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="View Student Evaluation Records (Right/Wrong Answers)">
                                    <IconButton 
                                        onClick={() => { fetchQuizRecords(); setMcqRecordsOpen(true); }} 
                                        sx={{ color: "#10b981", bgcolor: "rgba(16, 185, 129, 0.15)", "&:hover": { bgcolor: "rgba(16, 185, 129, 0.25)" } }}
                                    >
                                        <AssessmentIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                <Tooltip title="My Score & Quiz Performance">
                                    <IconButton 
                                        onClick={() => setStudentScoreModalOpen(true)} 
                                        sx={{ color: "#f59e0b", bgcolor: "rgba(245, 158, 11, 0.15)", "&:hover": { bgcolor: "rgba(245, 158, 11, 0.25)" } }}
                                    >
                                        <Badge badgeContent={studentScoreHistory.filter(s => s.isCorrect).length} color="success">
                                            <EmojiEventsIcon />
                                        </Badge>
                                    </IconButton>
                                </Tooltip>
                                {activeMcq && (
                                    <Tooltip title="View Active MCQ Quiz">
                                        <IconButton 
                                            onClick={() => {}} 
                                            sx={{ color: "#38bdf8", bgcolor: "rgba(56, 189, 248, 0.15)", "&:hover": { bgcolor: "rgba(56, 189, 248, 0.25)" } }}
                                        >
                                            <Badge badgeContent="!" color="error">
                                                <QuizIcon />
                                            </Badge>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </>
                        )}

                        <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255, 255, 255, 0.15)", mx: 0.5 }} />

                        {/* Group 3: End Call (Danger Action Button) */}
                        <Tooltip title="Leave / End Meeting">
                            <IconButton 
                                onClick={handleEndCall} 
                                sx={{ bgcolor: "#ef4444", color: "#ffffff", "&:hover": { bgcolor: "#dc2626", transform: "scale(1.05)" }, transition: "all 0.2s ease" }}
                            >
                                <CallEndIcon />
                            </IconButton>
                        </Tooltip>
                    </div>

                    {/* Movable & Scaled Down Self Video Card */}
                    {!isLocalVideoMainStage && (
                        <div
                            id="video-wrapper-self"
                            onMouseDown={handleSelfVideoMouseDown}
                            onTouchStart={handleSelfVideoTouchStart}
                            style={{
                                position: 'absolute',
                                left: `${selfVideoPos.x}px`,
                                top: `${selfVideoPos.y}px`,
                                width: '165px',
                                height: '105px',
                                zIndex: 25,
                                cursor: isDraggingSelfVideo ? 'grabbing' : 'grab',
                                userSelect: 'none',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '2px solid #0e71eb',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
                                background: '#18181b',
                                transition: isDraggingSelfVideo ? 'none' : 'box-shadow 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {LocalVideoContent}
                        </div>
                    )}

                    <div className={`${styles.conferenceView} ${showModal ? styles.conferenceViewShifted : ''}`}>
                        {isLocalVideoMainStage && (
                            <div id="video-wrapper-self" className={styles.videoWrapper} style={{ position: 'relative', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: screen ? '1 1 100%' : '1 1 320px', maxHeight: screen ? 'calc(100vh - 120px)' : 'none' }}>
                                {LocalVideoContent}
                            </div>
                        )}
                        {videos.map((v) => {
                            const participant = roomParticipants.find(p => p.socketId === v.socketId);
                            const participantName = participant?.username || `User_${v.socketId.substring(0, 4)}`;
                            const mediaState = peerMediaStates[v.socketId] || { video: true, audio: true };
                            const isRemoteVideoOn = mediaState.video !== false;

                            return (
                                <div id={`video-wrapper-${v.socketId}`} key={v.socketId} className={styles.videoWrapper} style={{ position: "relative", background: "#18181b", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                    {isTrainerOrAdmin && (
                                        <div className={styles.hostControlsOverlay}>
                                            <Tooltip title="Request Student to Enable Video Camera (User Permission)">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleRequestStudentCamera(v.socketId)}
                                                    style={{ color: '#38bdf8' }}
                                                >
                                                    <VideoCameraFrontIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {socketIdRef.current === activeHostId && (
                                                <Tooltip title="Remove Participant">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleRemoveParticipant(v.socketId, participantName)}
                                                        style={{ color: '#ef4444' }}
                                                    >
                                                        <PersonRemoveIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </div>
                                    )}

                                    {/* Live Stream or Profile Avatar when Camera is Off */}
                                    {isRemoteVideoOn ? (
                                        <video
                                            data-socket={v.socketId}
                                            ref={ref => {
                                                if (ref && v.stream) {
                                                    if (ref.srcObject !== v.stream) {
                                                        ref.srcObject = v.stream;
                                                    }
                                                    ref.play().catch(err => console.log("Remote video play error:", err));
                                                }
                                            }}
                                            autoPlay
                                            playsInline
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        >
                                        </video>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", height: "100%" }}>
                                            <Avatar 
                                                src={participant?.profilePic || ''} 
                                                sx={{ 
                                                    width: 120, 
                                                    height: 120, 
                                                    bgcolor: 'rgba(255,255,255,0.1)', 
                                                    border: '2px solid rgba(255,255,255,0.25)'
                                                }}
                                            >
                                                <PersonIcon sx={{ fontSize: 80, color: '#94a3b8' }} />
                                            </Avatar>
                                            <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>
                                                {participantName} (Camera Off)
                                            </Typography>
                                        </div>
                                    )}

                                    {/* Frame Corner Status Badges (Mic & Video Off Icons) */}
                                    <div style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                        display: "flex",
                                        gap: "6px",
                                        zIndex: 5
                                    }}>
                                        {mediaState.video === false && (
                                            <Tooltip title="Camera Off">
                                                <Box sx={{ bgcolor: "rgba(239, 68, 68, 0.9)", borderRadius: "50%", p: "4px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                                                    <VideocamOffIcon sx={{ fontSize: 15, color: "#ffffff" }} />
                                                </Box>
                                            </Tooltip>
                                        )}
                                        {mediaState.audio === false ? (
                                            <Tooltip title="Microphone Muted">
                                                <Box sx={{ bgcolor: "rgba(239, 68, 68, 0.9)", borderRadius: "50%", p: "4px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                                                    <MicOffIcon sx={{ fontSize: 15, color: "#ffffff" }} />
                                                </Box>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Microphone Active">
                                                <Box sx={{ bgcolor: "rgba(16, 185, 129, 0.9)", borderRadius: "50%", p: "4px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                                                    <MicIcon sx={{ fontSize: 15, color: "#ffffff" }} />
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </div>

                                    {/* Fullscreen Button for Remote Video */}
                                    <div style={{
                                        position: "absolute",
                                        bottom: "10px",
                                        right: "10px",
                                        zIndex: 5
                                    }}>
                                        <Tooltip title="Full Screen">
                                            <IconButton size="small" onClick={() => handleFullscreen(`video-wrapper-${v.socketId}`)} sx={{ color: "#ffffff", bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}>
                                                <FullscreenIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </div>

                                    {/* Name Banner at Bottom Left */}
                                    <div style={{
                                        position: "absolute",
                                        bottom: "8px",
                                        left: "10px",
                                        background: "rgba(15, 23, 42, 0.75)",
                                        backdropFilter: "blur(6px)",
                                        padding: "3px 10px",
                                        borderRadius: "6px",
                                        color: "#ffffff",
                                        fontSize: "0.78rem",
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        pointerEvents: "none"
                                    }}>
                                        <span>{participantName}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Student Live MCQ Widget (On-Screen & Draggable & Minimizable) */}
                    {activeMcq && mcqMinimized && (
                        <Paper
                            elevation={8}
                            onMouseDown={handleMcqMouseDown}
                            onTouchStart={handleMcqTouchStart}
                            sx={{
                                position: 'fixed',
                                left: `${mcqCardPos.x}px`,
                                top: `${mcqCardPos.y}px`,
                                zIndex: 100,
                                cursor: isDraggingMcqCard ? "grabbing" : "grab",
                                backgroundColor: '#1c1c20',
                                border: '2px solid #007afc',
                                borderRadius: '24px',
                                px: 2,
                                py: 0.8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                                userSelect: 'none'
                            }}
                        >
                            <DragIndicatorIcon sx={{ color: '#6b7280', fontSize: 18 }} />
                            <QuizIcon sx={{ color: '#007afc', fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>
                                Live MCQ ({`00:${mcqTimeLeft < 10 ? '0' + mcqTimeLeft : mcqTimeLeft}`})
                            </Typography>
                            <Tooltip title="Expand Quiz View">
                                <IconButton
                                    size="small"
                                    onClick={() => setMcqMinimized(false)}
                                    sx={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
                                >
                                    <OpenInFullIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Paper>
                    )}

                    {activeMcq && !mcqMinimized && (
                        <Paper
                            elevation={12}
                            sx={{
                                position: 'fixed',
                                top: `${mcqCardPos.y}px`,
                                left: `${mcqCardPos.x}px`,
                                width: 380,
                                maxHeight: 'calc(100vh - 160px)',
                                backgroundColor: '#222226',
                                border: '1px solid #38383e',
                                borderRadius: '12px',
                                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(8px)',
                                zIndex: 100,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Header Bar (Fixed Top & Draggable) */}
                            <Box
                                onMouseDown={handleMcqMouseDown}
                                onTouchStart={handleMcqTouchStart}
                                sx={{
                                    flexShrink: 0,
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #2e2e34',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: isDraggingMcqCard ? "grabbing" : "grab",
                                    userSelect: "none",
                                    backgroundColor: '#1c1c20'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DragIndicatorIcon sx={{ color: '#6b7280', fontSize: 18 }} />
                                    <QuizIcon sx={{ color: '#007afc' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                                        Live Classroom MCQ
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Chip 
                                        label={`00:${mcqTimeLeft < 10 ? '0' + mcqTimeLeft : mcqTimeLeft}`}
                                        sx={{ 
                                            backgroundColor: mcqTimeLeft <= 5 ? '#ef4444' : '#007afc',
                                            color: '#ffffff',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem',
                                            height: '24px'
                                        }}
                                        size="small"
                                    />
                                    <Tooltip title="Minimize to Floating Badge (Full Video View)">
                                        <IconButton
                                            size="small"
                                            onClick={() => setMcqMinimized(true)}
                                            sx={{ color: '#a1a1a6', '&:hover': { color: '#ffffff' } }}
                                        >
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Close Quiz View">
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setActiveMcq(null);
                                                setQuizFeedback(null);
                                                setStudentSelectedOption(null);
                                            }}
                                            sx={{ color: '#a1a1a6', '&:hover': { color: '#ffffff' } }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            {/* Internal Scroll Body (Question & Options) */}
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    padding: '16px'
                                }}
                            >
                                <Typography variant="body1" sx={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', mb: 2, lineHeight: 1.4 }}>
                                    {activeMcq.question}
                                </Typography>

                                <FormControl component="fieldset" fullWidth>
                                    <RadioGroup
                                        value={studentSelectedOption !== null ? studentSelectedOption : ""}
                                        onChange={(e) => setStudentSelectedOption(Number(e.target.value))}
                                    >
                                        {activeMcq.options.map((opt, idx) => (
                                            <Paper
                                                key={idx}
                                                variant="outlined"
                                                onClick={() => {
                                                    if (!quizFeedback?.submitted && mcqTimeLeft > 0) {
                                                        setStudentSelectedOption(idx);
                                                    }
                                                }}
                                                sx={{
                                                    mb: 1.5,
                                                    px: 1.5,
                                                    py: 1,
                                                    borderRadius: '8px',
                                                    border: studentSelectedOption === idx ? '2px solid #0e71eb' : '1px solid #38383e',
                                                    backgroundColor: studentSelectedOption === idx ? 'rgba(14, 113, 235, 0.15)' : '#1a1a1d',
                                                    color: '#ffffff',
                                                    cursor: (quizFeedback?.submitted || mcqTimeLeft === 0) ? 'default' : 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                <FormControlLabel
                                                    value={idx}
                                                    control={<Radio size="small" sx={{ color: '#a1a1a6', '&.Mui-checked': { color: '#0e71eb' } }} />}
                                                    label={<Typography variant="body2" sx={{ color: '#ffffff', fontWeight: studentSelectedOption === idx ? 700 : 400 }}>{opt}</Typography>}
                                                    disabled={quizFeedback?.submitted || mcqTimeLeft === 0}
                                                    sx={{ width: '100%', m: 0 }}
                                                />
                                            </Paper>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </Box>

                            {/* Action Footer (Pinned Bottom) */}
                            <Box
                                sx={{
                                    flexShrink: 0,
                                    padding: '12px 16px',
                                    borderTop: '1px solid #2e2e34',
                                    backgroundColor: '#222226'
                                }}
                            >
                                {quizFeedback?.submitted ? (
                                    <Alert
                                        severity={quizFeedback.isCorrect ? "success" : "error"}
                                        icon={quizFeedback.isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                                        sx={{ borderRadius: '8px', bgcolor: quizFeedback.isCorrect ? '#064e3b' : '#450a0a', color: '#ffffff' }}
                                    >
                                        {quizFeedback.isCorrect ? (
                                            <strong>Correct Answer! Great Job!</strong>
                                        ) : (
                                            <span>Wrong Answer. Correct Option: <strong>{activeMcq.options[quizFeedback.correctOptionIndex]}</strong></span>
                                        )}
                                    </Alert>
                                ) : (
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        disabled={studentSelectedOption === null || mcqTimeLeft === 0}
                                        onClick={handleSubmitStudentAnswer}
                                        sx={{
                                            backgroundColor: '#0e71eb !important',
                                            color: '#ffffff !important',
                                            '&:hover': { backgroundColor: '#0b5ed7 !important' },
                                            '&.Mui-disabled': {
                                                backgroundColor: '#1e3a5f !important',
                                                color: '#94a3b8 !important',
                                                opacity: 0.85
                                            },
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            borderRadius: '6px',
                                            py: 1,
                                            width: '100%'
                                        }}
                                    >
                                        Submit Answer
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    )}

                    {/* MCQ Builder Modal (Trainer / Admin) */}
                    <Dialog
                        open={mcqModalOpen}
                        onClose={() => setMcqModalOpen(false)}
                        fullWidth
                        maxWidth="sm"
                        sx={{
                            zIndex: 200,
                            "& .MuiBackdrop-root": {
                                backgroundColor: "rgba(0, 0, 0, 0.75)",
                                backdropFilter: "blur(4px)"
                            }
                        }}
                        PaperProps={{
                            sx: {
                                bgcolor: "#242428",
                                color: "#ffffff",
                                borderRadius: "12px",
                                border: "1px solid #333338",
                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                                overflow: "hidden"
                            }
                        }}
                    >
                        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #333338", pb: 1.5, pt: 2, px: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                <QuizIcon sx={{ color: "#0e71eb", fontSize: 24 }} />
                                <Typography variant="h6" fontWeight="bold" sx={{ color: "#ffffff" }}>
                                    Create & Launch MCQ Question
                                </Typography>
                            </Box>
                            <IconButton onClick={() => setMcqModalOpen(false)} sx={{ color: "#a1a1a6", "&:hover": { color: "#ffffff" } }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ px: 3, py: 2.5 }}>
                            <Typography variant="body2" sx={{ color: "#a1a1a6", mb: 2.5, lineHeight: 1.5 }}>
                                Display a multiple-choice question on all student screens during the live lecture session.
                            </Typography>

                            {/* Question Text Area with Standard Label */}
                            <Box sx={{ mb: 2.5 }}>
                                <label className={styles.mcqFormLabel} htmlFor="mcq-question-textarea">
                                    Question Text
                                </label>
                                <textarea
                                    id="mcq-question-textarea"
                                    className={styles.mcqFormTextarea}
                                    value={mcqQuestion}
                                    onChange={(e) => setMcqQuestion(e.target.value)}
                                    placeholder="e.g. What is the output of 2 + 2?"
                                />
                            </Box>

                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#ffffff", mb: 2 }}>
                                Options & Correct Answer:
                            </Typography>

                            {/* Option Inputs with Standard Labels and Aligned Radio Buttons */}
                            {mcqOptions.map((opt, idx) => (
                                <Box key={idx} sx={{ mb: 2 }}>
                                    <label className={styles.mcqFormLabel} htmlFor={`mcq-option-input-${idx}`}>
                                        Option {String.fromCharCode(65 + idx)}
                                    </label>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <Radio
                                            checked={mcqCorrectIndex === idx}
                                            onChange={() => setMcqCorrectIndex(idx)}
                                            value={idx}
                                            name="correct-option-radio"
                                            sx={{
                                                p: 0,
                                                color: "#a1a1a6",
                                                "&.Mui-checked": { color: "#0e71eb" }
                                            }}
                                        />
                                        <input
                                            id={`mcq-option-input-${idx}`}
                                            type="text"
                                            className={styles.mcqFormInput}
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...mcqOptions];
                                                newOpts[idx] = e.target.value;
                                                setMcqOptions(newOpts);
                                            }}
                                            placeholder={`Enter text for Option ${String.fromCharCode(65 + idx)}`}
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #333338", bgcolor: "#1f1f23" }}>
                            <Button
                                onClick={() => setMcqModalOpen(false)}
                                sx={{ textTransform: "none", color: "#a1a1a6", fontWeight: "bold", "&:hover": { bgcolor: "#2c2c30", color: "#ffffff" } }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleLaunchNewQuiz}
                                sx={{
                                    backgroundColor: "#0e71eb",
                                    color: "#ffffff",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    borderRadius: "6px",
                                    px: 2.5,
                                    "&:hover": { backgroundColor: "#0b5ed7" }
                                }}
                            >
                                Launch MCQ to Students
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* MCQ Records & Evaluation Dialog (Trainer / Admin) */}
                    <Dialog
                        open={mcqRecordsOpen}
                        onClose={() => setMcqRecordsOpen(false)}
                        fullWidth
                        maxWidth="md"
                        sx={{
                            zIndex: 200,
                            "& .MuiBackdrop-root": {
                                backgroundColor: "rgba(0, 0, 0, 0.75)",
                                backdropFilter: "blur(4px)"
                            }
                        }}
                        PaperProps={{
                            sx: {
                                bgcolor: "#242428",
                                color: "#ffffff",
                                borderRadius: "12px",
                                border: "1px solid #333338",
                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                                overflow: "hidden"
                            }
                        }}
                    >
                        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333338', pb: 1.5, pt: 2, px: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                <AssessmentIcon sx={{ color: '#10b981', fontSize: 24 }} />
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffffff' }}>
                                    Student Evaluation & Answer Breakdown
                                </Typography>
                            </Box>
                            <IconButton onClick={() => setMcqRecordsOpen(false)} sx={{ color: "#a1a1a6", "&:hover": { color: "#ffffff" } }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ px: 3, py: 2.5 }}>
                            {/* Metric Cards Summary */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Paper sx={{ p: 2, flex: 1, backgroundColor: '#064e3b', border: '1px solid #059669', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setEvalTabValue(0)}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#34d399' }}>
                                        {quizRecords.submissions ? quizRecords.submissions.filter(s => s.isCorrect).length : 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#a7f3d0', fontWeight: 600 }}>
                                        Right Answer
                                    </Typography>
                                </Paper>
                                <Paper sx={{ p: 2, flex: 1, backgroundColor: '#450a0a', border: '1px solid #dc2626', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setEvalTabValue(1)}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#f87171' }}>
                                        {quizRecords.submissions ? quizRecords.submissions.filter(s => !s.isCorrect).length : 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#fecaca', fontWeight: 600 }}>
                                        Wrong Answer
                                    </Typography>
                                </Paper>
                                <Paper sx={{ p: 2, flex: 1, backgroundColor: '#431407', border: '1px solid #ea580c', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setEvalTabValue(2)}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#fb923c' }}>
                                        {(() => {
                                            const respondedSet = new Set((quizRecords.submissions || []).map(s => s.studentUsername || s.studentName));
                                            return roomParticipants.filter(p => p.role === 'student' && !respondedSet.has(p.username)).length;
                                        })()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#fed7aa', fontWeight: 600 }}>
                                        Not Responded
                                    </Typography>
                                </Paper>
                            </Box>

                            {/* 3 Categorized Tabs */}
                            <Box sx={{ borderBottom: 1, borderColor: '#333338', mb: 2 }}>
                                <Tabs
                                    value={evalTabValue}
                                    onChange={(e, val) => setEvalTabValue(val)}
                                    sx={{
                                        "& .MuiTab-root": { color: "#a1a1a6", textTransform: "none", fontWeight: 700 },
                                        "& .Mui-selected": { color: "#0e71eb !important" },
                                        "& .MuiTabs-indicator": { backgroundColor: "#0e71eb" }
                                    }}
                                >
                                    <Tab icon={<CheckCircleIcon sx={{ color: '#34d399' }} />} iconPosition="start" label={`Right Answer (${quizRecords.submissions ? quizRecords.submissions.filter(s => s.isCorrect).length : 0})`} />
                                    <Tab icon={<CancelIcon sx={{ color: '#f87171' }} />} iconPosition="start" label={`Wrong Answer (${quizRecords.submissions ? quizRecords.submissions.filter(s => !s.isCorrect).length : 0})`} />
                                    <Tab icon={<HourglassEmptyIcon sx={{ color: '#fb923c' }} />} iconPosition="start" label={`Not Responded (${(() => {
                                        const respondedSet = new Set((quizRecords.submissions || []).map(s => s.studentUsername || s.studentName));
                                        return roomParticipants.filter(p => p.role === 'student' && !respondedSet.has(p.username)).length;
                                    })()})`} />
                                </Tabs>
                            </Box>

                            {/* Tab 0: Right Answer */}
                            {evalTabValue === 0 && (
                                <Grid container spacing={1.5}>
                                    {quizRecords.submissions && quizRecords.submissions.filter(s => s.isCorrect).length > 0 ? (
                                        quizRecords.submissions.filter(s => s.isCorrect).map((sub, idx) => (
                                            <Grid item xs={12} sm={6} key={idx}>
                                                <Card variant="outlined" sx={{ borderRadius: '8px', borderColor: '#059669', backgroundColor: '#1a1a1e' }}>
                                                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                                                                {sub.studentName || sub.studentUsername}
                                                            </Typography>
                                                            <Chip label="Right" size="small" color="success" sx={{ fontWeight: 'bold' }} />
                                                        </Box>
                                                        <Typography variant="caption" sx={{ color: '#34d399' }}>
                                                            Submitted Option: {sub.selectedOptionIndex + 1}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))
                                    ) : (
                                        <Typography variant="body2" sx={{ color: '#a1a1a6', fontStyle: 'italic', p: 2 }}>
                                            No right answers recorded for this question yet.
                                        </Typography>
                                    )}
                                </Grid>
                            )}

                            {/* Tab 1: Wrong Answer */}
                            {evalTabValue === 1 && (
                                <Grid container spacing={1.5}>
                                    {quizRecords.submissions && quizRecords.submissions.filter(s => !s.isCorrect).length > 0 ? (
                                        quizRecords.submissions.filter(s => !s.isCorrect).map((sub, idx) => (
                                            <Grid item xs={12} sm={6} key={idx}>
                                                <Card variant="outlined" sx={{ borderRadius: '8px', borderColor: '#dc2626', backgroundColor: '#1a1a1e' }}>
                                                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                                                                {sub.studentName || sub.studentUsername}
                                                            </Typography>
                                                            <Chip label="Wrong" size="small" color="error" sx={{ fontWeight: 'bold' }} />
                                                        </Box>
                                                        <Typography variant="caption" sx={{ color: '#f87171' }}>
                                                            Submitted Option: {sub.selectedOptionIndex + 1}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))
                                    ) : (
                                        <Typography variant="body2" sx={{ color: '#a1a1a6', fontStyle: 'italic', p: 2 }}>
                                            No wrong answers recorded. Great performance!
                                        </Typography>
                                    )}
                                </Grid>
                            )}

                            {/* Tab 2: Not Responded */}
                            {evalTabValue === 2 && (
                                <Grid container spacing={1.5}>
                                    {(() => {
                                        const respondedSet = new Set((quizRecords.submissions || []).map(s => s.studentUsername || s.studentName));
                                        const notResponded = roomParticipants.filter(p => p.role === 'student' && !respondedSet.has(p.username));

                                        if (notResponded.length > 0) {
                                            return notResponded.map((p, idx) => (
                                                <Grid item xs={12} sm={6} key={idx}>
                                                    <Card variant="outlined" sx={{ borderRadius: '8px', borderColor: '#ea580c', backgroundColor: '#1a1a1e' }}>
                                                        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                                                                    {p.username}
                                                                </Typography>
                                                                <Chip label="Not Responded" size="small" color="warning" sx={{ fontWeight: 'bold' }} />
                                                            </Box>
                                                            <Typography variant="caption" sx={{ color: '#fb923c' }}>
                                                                Awaiting answer...
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ));
                                        } else {
                                            return (
                                                <Typography variant="body2" sx={{ color: '#a1a1a6', fontStyle: 'italic', p: 2 }}>
                                                    All active students in the classroom have submitted their answers!
                                                </Typography>
                                            );
                                        }
                                    })()}
                                </Grid>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #333338', bgcolor: '#1f1f23' }}>
                            <Button onClick={() => setMcqRecordsOpen(false)} sx={{ textTransform: 'none', fontWeight: 'bold', color: '#a1a1a6', '&:hover': { bgcolor: '#2c2c30', color: '#ffffff' } }}>
                                Close Evaluation Records
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Participants List Modal */}
                    <Dialog
                        open={participantsModalOpen}
                        onClose={() => setParticipantsModalOpen(false)}
                        fullWidth
                        maxWidth="xs"
                        sx={{
                            zIndex: 200,
                            "& .MuiBackdrop-root": {
                                backgroundColor: "rgba(0, 0, 0, 0.75)",
                                backdropFilter: "blur(4px)"
                            }
                        }}
                        PaperProps={{
                            sx: {
                                bgcolor: "#242428",
                                color: "#ffffff",
                                borderRadius: "12px",
                                border: "1px solid #333338",
                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                                overflow: "hidden"
                            }
                        }}
                    >
                        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5, pt: 2, px: 3, borderBottom: "1px solid #333338" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <GroupIcon sx={{ color: "#0e71eb" }} />
                                <Typography variant="h6" fontWeight="bold" sx={{ color: "#ffffff" }}>
                                    Room Participants ({totalParticipantsCount})
                                </Typography>
                            </Box>
                            <IconButton onClick={() => setParticipantsModalOpen(false)} sx={{ color: "#a1a1a6", "&:hover": { color: "#ffffff" } }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ p: 2.5 }}>
                            <List sx={{ pt: 0, pb: 0 }}>
                                {/* Self / Local User Item */}
                                <ListItem
                                    sx={{
                                        bgcolor: "#1a1a1e",
                                        borderRadius: "8px",
                                        mb: 1.5,
                                        p: 1.5,
                                        border: "1px solid #3a3a40",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <PersonIcon sx={{ color: "#0e71eb" }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#ffffff" }}>
                                                {username || "You"} (Self)
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "#a1a1a6" }}>
                                                {video ? "Camera On" : "Camera Off"} • {audio ? "Mic On" : "Muted"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        icon={isHost ? <StarIcon style={{ fontSize: 14, color: '#f59e0b' }} /> : undefined}
                                        label={isHost ? "Host / Instructor" : (userRole || "student").toUpperCase()}
                                        color={isHost ? "secondary" : "primary"}
                                        size="small"
                                        sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
                                    />
                                </ListItem>

                                {/* Remote Connected Participants */}
                                {otherParticipants.length > 0 ? (
                                    otherParticipants.map((p, idx) => {
                                        // Strictly ONLY ONE Host in the room session!
                                        // If local user is host, no remote participant is host.
                                        // If local user is NOT host, only the remote participant matching hostId is host.
                                        const isParticipantHost = !isHost && (p.socketId === hostId);
                                        return (
                                            <ListItem
                                                key={p.socketId || idx}
                                                sx={{
                                                    bgcolor: "#1a1a1e",
                                                    borderRadius: "8px",
                                                    mb: 1.5,
                                                    p: 1.5,
                                                    border: "1px solid #3a3a40",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                    <PersonIcon sx={{ color: isParticipantHost ? "#f59e0b" : "#10b981" }} />
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#ffffff" }}>
                                                            {p.username || `Participant ${idx + 1}`}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: "#a1a1a6" }}>
                                                            Connected Member
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <Chip
                                                        icon={isParticipantHost ? <StarIcon style={{ fontSize: 14, color: '#f59e0b' }} /> : undefined}
                                                        label={isParticipantHost ? "Host / Instructor" : (p.role || "student").toUpperCase()}
                                                        color={isParticipantHost ? "secondary" : "default"}
                                                        size="small"
                                                        sx={{ fontWeight: "bold", fontSize: "0.7rem", color: "#ffffff" }}
                                                    />
                                                    {isTrainerOrAdmin && !isParticipantHost && (
                                                        <Tooltip title={`Remove ${p.username || 'Participant'} from Meeting`}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRemoveParticipant(p.socketId, p.username)}
                                                                sx={{
                                                                    color: "#ef4444",
                                                                    bgcolor: "rgba(239, 68, 68, 0.15)",
                                                                    ml: 1,
                                                                    "&:hover": { bgcolor: "rgba(239, 68, 68, 0.3)" }
                                                                }}
                                                            >
                                                                <PersonRemoveIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </ListItem>
                                        );
                                    })
                                ) : videos.length > 0 ? (
                                    videos.map((v, idx) => (
                                        <ListItem
                                            key={v.socketId || idx}
                                            sx={{
                                                bgcolor: "#1a1a1e",
                                                borderRadius: "8px",
                                                mb: 1.5,
                                                p: 1.5,
                                                border: "1px solid #3a3a40",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center"
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <PersonIcon sx={{ color: "#10b981" }} />
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#ffffff" }}>
                                                        Participant #{idx + 1}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: "#a1a1a6" }}>
                                                        Live Video Feed Active
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip
                                                label="STUDENT"
                                                size="small"
                                                sx={{ fontWeight: "bold", fontSize: "0.7rem", color: "#ffffff" }}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography variant="body2" sx={{ color: "#a1a1a6", fontStyle: "italic", p: 2, textAlign: "center" }}>
                                        No other participants have joined the classroom yet. Share the session code to invite students!
                                    </Typography>
                                )}
                            </List>
                        </DialogContent>
                    </Dialog>

                    {/* Camera Permission Request Dialog (Student Prompt) */}
                    <Dialog
                        open={cameraReqDialogOpen}
                        onClose={() => handleCameraReqResponse(false)}
                        sx={{
                            zIndex: 200,
                            "& .MuiBackdrop-root": {
                                backgroundColor: "rgba(0, 0, 0, 0.75)",
                                backdropFilter: "blur(4px)"
                            }
                        }}
                        PaperProps={{
                            sx: {
                                bgcolor: "#242428",
                                color: "#ffffff",
                                borderRadius: "12px",
                                border: "1px solid #333338",
                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                                overflow: "hidden"
                            }
                        }}
                    >
                        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, pt: 2, px: 3, pb: 1.5, borderBottom: "1px solid #333338" }}>
                            <VideoCameraFrontIcon sx={{ color: '#0e71eb' }} />
                            <Typography variant="h6" fontWeight="bold" sx={{ color: "#ffffff" }}>
                                Trainer Camera Permission Request
                            </Typography>
                        </DialogTitle>
                        <DialogContent sx={{ px: 3, py: 2.5 }}>
                            <Typography variant="body1" sx={{ color: '#ffffff', my: 1 }}>
                                Trainer <strong>{cameraReqHostName}</strong> has requested to turn on your video camera.
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#a1a1a6' }}>
                                Your camera will only be enabled if you explicitly allow it below.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #333338", bgcolor: "#1f1f23" }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleCameraReqResponse(false)}
                                sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: '6px' }}
                            >
                                Decline
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => handleCameraReqResponse(true)}
                                sx={{
                                    backgroundColor: '#0e71eb',
                                    color: '#ffffff',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    borderRadius: '6px',
                                    '&:hover': { backgroundColor: '#0b5ed7' }
                                }}
                            >
                                Allow Video Camera
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Student Score & Performance Modal */}
                    <Dialog
                        open={studentScoreModalOpen}
                        onClose={() => setStudentScoreModalOpen(false)}
                        fullWidth
                        maxWidth="sm"
                        sx={{
                            zIndex: 200,
                            "& .MuiBackdrop-root": {
                                backgroundColor: "rgba(0, 0, 0, 0.75)",
                                backdropFilter: "blur(4px)"
                            }
                        }}
                        PaperProps={{
                            sx: {
                                bgcolor: "#242428",
                                color: "#ffffff",
                                borderRadius: "12px",
                                border: "1px solid #333338",
                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                                overflow: "hidden"
                            }
                        }}
                    >
                        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333338', pb: 1.5, pt: 2, px: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmojiEventsIcon sx={{ color: '#f59e0b' }} />
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffffff' }}>
                                    My Quiz Score & Performance
                                </Typography>
                            </Box>
                            <IconButton onClick={() => setStudentScoreModalOpen(false)} sx={{ color: "#a1a1a6", "&:hover": { color: "#ffffff" } }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ px: 3, py: 2.5 }}>
                            {/* Score Summary Metrics */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Paper sx={{ p: 2, flex: 1, backgroundColor: '#422006', border: '1px solid #ca8a04', borderRadius: '10px', textAlign: 'center' }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#facc15' }}>
                                        {studentScoreHistory.reduce((acc, curr) => acc + (curr.scoreEarned || 0), 0)} pts
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#fef08a', fontWeight: 600 }}>
                                        Total Score Earned
                                    </Typography>
                                </Paper>
                                <Paper sx={{ p: 2, flex: 1, backgroundColor: '#064e3b', border: '1px solid #059669', borderRadius: '10px', textAlign: 'center' }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#34d399' }}>
                                        {studentScoreHistory.filter(s => s.isCorrect).length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#a7f3d0', fontWeight: 600 }}>
                                        Correct Answers
                                    </Typography>
                                </Paper>
                                <Paper sx={{ p: 2, flex: 1, backgroundColor: '#450a0a', border: '1px solid #dc2626', borderRadius: '10px', textAlign: 'center' }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#f87171' }}>
                                        {studentScoreHistory.filter(s => !s.isCorrect).length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#fecaca', fontWeight: 600 }}>
                                        Wrong Answers
                                    </Typography>
                                </Paper>
                            </Box>

                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', mb: 1.5 }}>
                                Questions Answered Log:
                            </Typography>

                            {studentScoreHistory.length > 0 ? (
                                <List sx={{ width: '100%', p: 0 }}>
                                    {studentScoreHistory.map((item, idx) => (
                                        <Paper key={idx} variant="outlined" sx={{ mb: 1.5, p: 1.5, borderRadius: '8px', bgcolor: '#1a1a1e', borderColor: '#3a3a40', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                {item.isCorrect ? (
                                                    <CheckCircleIcon sx={{ color: '#34d399' }} />
                                                ) : (
                                                    <CancelIcon sx={{ color: '#f87171' }} />
                                                )}
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                                                        {item.questionText}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#a1a1a6' }}>
                                                        Answered at {item.submittedAt}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip
                                                label={item.isCorrect ? `+${item.scoreEarned || 1} pt` : '0 pts'}
                                                size="small"
                                                color={item.isCorrect ? "success" : "error"}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Paper>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" sx={{ color: '#a1a1a6', fontStyle: 'italic', p: 2, textAlign: 'center' }}>
                                    You haven't answered any MCQ questions in this session yet.
                                </Typography>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #333338", bgcolor: "#1f1f23" }}>
                            <Button onClick={() => setStudentScoreModalOpen(false)} sx={{ textTransform: 'none', fontWeight: 'bold', color: '#a1a1a6', '&:hover': { bgcolor: '#2c2c30', color: '#ffffff' } }}>
                                Close Scorecard
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            }
        </div>
    );
}
