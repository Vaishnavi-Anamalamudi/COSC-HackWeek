import { motion } from 'framer-motion';
import Chat from './Chat.jsx';
import Participants from './Participants.jsx';

export default function RightSidebar({ user, participants, activity, messages, typingUsers, onSendMessage, onTyping }) {
  return (
    <motion.aside
      className="glass-panel z-40 hidden h-[calc(100vh-5rem)] w-80 shrink-0 flex-col rounded-3xl p-4 lg:flex"
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Participants participants={participants} activity={activity} />
      <div className="my-4 h-px bg-slate-700/80" />
      <Chat user={user} messages={messages} typingUsers={typingUsers} onSend={onSendMessage} onTyping={onTyping} />
    </motion.aside>
  );
}
