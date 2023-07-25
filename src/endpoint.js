export const buildAxiosRequest = (answers, username) => {
    if (!username) username = answers.username;
    const isGhe = answers.gitHubType === "ghe";
    const range = answers.year ? `?tab=overview&from=${answers.year}-01-01&to=${answers.year}-12-31` : "";
    return {
        url: `https://${isGhe ? answers.gheServer : "github.com"}/users/${username}/contributions${range}`, 
        config: {
            headers: {
                Cookie: isGhe ? `user_session=${answers.gheCookie}; Path=/; Expires=${new Date(Date.now() + 31536000000).toGMTString()};` : ""
            }
        }
    }
}