import toast from 'react-hot-toast';

export const SUPPORT_EMAIL = "synclearn.pvt@gmail.com";

/**
 * Generate Gmail Web compose URL
 */
export const getGmailComposeUrl = (subject = "SyncLearn Support Request", body = "") => {
    const baseUrl = "https://mail.google.com/mail/?view=cm&fs=1";
    const toParam = `&to=${encodeURIComponent(SUPPORT_EMAIL)}`;
    const suParam = `&su=${encodeURIComponent(subject)}`;
    const bodyParam = body ? `&body=${encodeURIComponent(body)}` : "";
    return `${baseUrl}${toParam}${suParam}${bodyParam}`;
};

/**
 * Generate Outlook Web compose URL
 */
export const getOutlookComposeUrl = (subject = "SyncLearn Support Request", body = "") => {
    const baseUrl = "https://outlook.office.com/mail/deeplink/compose";
    const toParam = `?to=${encodeURIComponent(SUPPORT_EMAIL)}`;
    const suParam = `&subject=${encodeURIComponent(subject)}`;
    const bodyParam = body ? `&body=${encodeURIComponent(body)}` : "";
    return `${baseUrl}${toParam}${suParam}${bodyParam}`;
};

/**
 * Generate Mailto URL
 */
export const getMailtoUrl = (subject = "SyncLearn Support Request", body = "") => {
    const suParam = `?subject=${encodeURIComponent(subject)}`;
    const bodyParam = body ? `&body=${encodeURIComponent(body)}` : "";
    return `mailto:${SUPPORT_EMAIL}${suParam}${bodyParam}`;
};

/**
 * Open Gmail Web Compose in new tab
 */
export const openGmailCompose = (subject, body) => {
    window.open(getGmailComposeUrl(subject, body), "_blank", "noopener,noreferrer");
};

/**
 * Open Outlook Web Compose in new tab
 */
export const openOutlookCompose = (subject, body) => {
    window.open(getOutlookComposeUrl(subject, body), "_blank", "noopener,noreferrer");
};

/**
 * Open default mail app via mailto
 */
export const openMailto = (subject, body) => {
    window.location.href = getMailtoUrl(subject, body);
};

/**
 * Copy support email to clipboard with user toast notification
 */
export const copySupportEmailToClipboard = async () => {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(SUPPORT_EMAIL);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = SUPPORT_EMAIL;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
        }
        toast.success(`Copied ${SUPPORT_EMAIL} to clipboard!`);
        return true;
    } catch (err) {
        toast.error(`Failed to copy. Support Email: ${SUPPORT_EMAIL}`);
        return false;
    }
};
