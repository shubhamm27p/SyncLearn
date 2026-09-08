const fs = require('fs');
let code = fs.readFileSync('frontend/zoom_clone/src/pages/videomate.jsx', 'utf8');

const returnRegex = /const totalParticipantsCount = Math\.max\(1 \+ otherParticipants\.length, videos\.length \+ 1\);\s*return \(\s*<div>/;
if(!returnRegex.test(code)) throw new Error('Could not find return statement');

const localVideoDef = `    const isLocalVideoMainStage = videos.length === 0 || screen === true;

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
        <div>`;

code = code.replace(returnRegex, localVideoDef);

const movableRegex = /\{\/\* Movable & Scaled Down Self Video Card \*\/\}[\s\S]*?(?=<div className=\{`\$\{styles\.conferenceView\})/m;

const movableReplacement = `{/* Movable & Scaled Down Self Video Card */}
                    {!isLocalVideoMainStage && (
                        <div
                            id="video-wrapper-self"
                            onMouseDown={handleSelfVideoMouseDown}
                            onTouchStart={handleSelfVideoTouchStart}
                            style={{
                                position: 'absolute',
                                left: \`\${selfVideoPos.x}px\`,
                                top: \`\${selfVideoPos.y}px\`,
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

                    `;

code = code.replace(movableRegex, movableReplacement);

const conferenceViewRegex = /(<div className=\{`\$\{styles\.conferenceView\}[^>]+>)/;
const conferenceViewReplacement = `$1
                        {isLocalVideoMainStage && (
                            <div id="video-wrapper-self" className={styles.videoWrapper} style={{ position: 'relative', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: screen ? '1 1 100%' : '1 1 320px', maxHeight: screen ? 'calc(100vh - 120px)' : 'none' }}>
                                {LocalVideoContent}
                            </div>
                        )}`;

code = code.replace(conferenceViewRegex, conferenceViewReplacement);

const remoteVideoOffRegex = /<Avatar[\s\S]*?<\/Avatar>/g;
code = code.replace(remoteVideoOffRegex, (match) => {
    if (match.includes('participant?.profilePic')) {
        return `<Avatar 
                                                src={participant?.profilePic || ''} 
                                                sx={{ 
                                                    width: 120, 
                                                    height: 120, 
                                                    bgcolor: 'rgba(255,255,255,0.1)', 
                                                    border: '2px solid rgba(255,255,255,0.25)'
                                                }}
                                            >
                                                <PersonIcon sx={{ fontSize: 80, color: '#94a3b8' }} />
                                            </Avatar>`;
    }
    return match;
});

fs.writeFileSync('frontend/zoom_clone/src/pages/videomate.jsx', code);
console.log('Successfully updated videomate.jsx');
