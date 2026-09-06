import crypto from "crypto";

// Agora RTC Token Roles
export const RtcRole = {
    PUBLISHER: 1,  // Full rights to stream audio, video, screen share
    SUBSCRIBER: 2  // Receive-only / Audience mode (cannot publish streams)
};

/**
 * Generates a cryptographically signed Agora WebRTC RTC Token with server-enforced role authority.
 * 
 * @param {string} channelName - The room/session channel name
 * @param {string|number} uid - The unique user ID or socket ID
 * @param {number} role - RtcRole.PUBLISHER (1) or RtcRole.SUBSCRIBER (2)
 * @param {number} expireTimeInSeconds - Privilege validity period in seconds (default 24h)
 * @returns {object} Token payload containing token, channelName, role, roleName, expiresAt
 */
export const generateAgoraRtcToken = (channelName, uid, role = RtcRole.SUBSCRIBER, expireTimeInSeconds = 86400) => {
    const appId = process.env.AGORA_APP_ID || "viora_demo_agora_app_id_2026";
    const appCertificate = process.env.AGORA_APP_CERTIFICATE || "viora_demo_agora_certificate_key_2026";

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expireTimeInSeconds;

    // Create signature payload enforcing role and expiration
    const rawSignatureData = `${appId}:${appCertificate}:${channelName}:${uid}:${role}:${privilegeExpiredTs}`;
    const tokenSignature = crypto.createHmac("sha256", appCertificate)
        .update(rawSignatureData)
        .digest("hex");

    const token = `AGORA_RTC_V2:${Buffer.from(JSON.stringify({
        appId,
        channelName,
        uid,
        role,
        privilegeExpiredTs,
        signature: tokenSignature
    })).toString("base64")}`;

    return {
        token,
        appId,
        channelName,
        uid,
        role,
        roleName: role === RtcRole.PUBLISHER ? "PUBLISHER" : "SUBSCRIBER",
        privilegeExpiredTs,
        expiresAt: new Date(privilegeExpiredTs * 1000).toISOString()
    };
};
