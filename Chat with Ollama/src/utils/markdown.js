export function conversationToMarkdown(conversation) {
  const lines = [`# ${conversation.title}`, ""];
  conversation.messages.forEach((message) => {
    lines.push(`## ${message.role === "user" ? "User" : "Assistant"}`);
    lines.push("");
    lines.push(message.content || "");
    lines.push("");
  });
  return lines.join("\n");
}

export function conversationToText(conversation) {
  return conversation.messages
    .map((message) => `${message.role.toUpperCase()}\n${message.content}`)
    .join("\n\n---\n\n");
}
