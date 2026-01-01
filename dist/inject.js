"use strict";
const originalFetch = window.fetch;
const client_id = ""; // IMGUR CLIENT ID
async function uploadImageToImgur(imageUrl) {
    if (!client_id)
        return undefined;
    const formData = new FormData();
    formData.append("image", imageUrl);
    formData.append("type", "URL");
    try {
        const resp = await originalFetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
                Authorization: `Client-ID ${client_id}`,
            },
            body: formData,
        });
        const result = await resp.json();
        if (result?.success && result?.data?.link) {
            return result.data.link;
        }
        return undefined;
    }
    catch (err) {
        return undefined;
    }
}
function getHeadersObj(init) {
    const headersObj = {};
    if (init?.headers) {
        try {
            const hdrs = new Headers(init.headers);
            hdrs.forEach((value, key) => {
                headersObj[key.toLowerCase()] = value;
            });
        }
        catch { }
    }
    return headersObj;
}
function createFetchInterceptor() {
    const interceptor = async (...args) => {
        const [input, init] = args;
        const method = init?.method || "GET";
        const url = typeof input === "string"
            ? input
            : input instanceof Request
                ? input.url
                : "";
        const headersObj = getHeadersObj(init);
        const isChatMessageRequest = method === "POST" &&
            url.includes("kick.com") &&
            headersObj["authorization"]?.startsWith("Bearer") &&
            headersObj["content-type"]?.includes("application/json");
        if (!isChatMessageRequest) {
            return originalFetch(...args);
        }
        let requestBody = null;
        if (init?.body && typeof init.body === "string") {
            try {
                requestBody = JSON.parse(init.body);
            }
            catch {
                return originalFetch(...args);
            }
        }
        const hasDiscordLink = requestBody &&
            typeof requestBody === "object" &&
            typeof requestBody.content === "string" &&
            requestBody.content.includes("cdn.discordapp.com/attachments/");
        if (!hasDiscordLink) {
            return originalFetch(...args);
        }
        const imgurLink = await uploadImageToImgur(requestBody.content);
        if (!imgurLink) {
            return originalFetch(...args);
        }
        const newRequestBody = {
            ...requestBody,
            content: imgurLink,
        };
        const newHeaders = {
            ...headersObj,
            "content-type": "application/json",
        };
        const newInit = {
            ...init,
            body: JSON.stringify(newRequestBody),
            headers: newHeaders,
        };
        return originalFetch(input, newInit);
    };
    return interceptor;
}
window.fetch = createFetchInterceptor();
