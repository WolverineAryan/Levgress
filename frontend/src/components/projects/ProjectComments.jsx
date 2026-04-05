import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import socket from "../../socket/socket";

export default function ProjectComments({ projectId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const fetchComments = useCallback(async () => {
    const res = await api.get(`/projects/${projectId}/comments`);
    setComments(res.data);
  }, [projectId]);

  const submitComment = async () => {
    if (!text) return;

    await api.post(`/projects/${projectId}/comment`, {
      text
    });

    setText("");
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchComments();

    // Join project room
    socket.emit("join-project", projectId);

    // Listen for real-time comments
    socket.on("new-comment", (comment) => {
      setComments((prev) => [...prev, comment]);
    });

    return () => {
      socket.off("new-comment");
    };
  }, [fetchComments, projectId]);

  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Comments</h4>

      <div className="space-y-3 max-h-40 overflow-y-auto mb-4">
        {comments.map((comment, index) => (
          <div
            key={index}
            className="bg-zinc-800 p-3 rounded-lg text-sm"
          >
            <p className="text-zinc-400 text-xs mb-1">
              {comment.user?.name}
            </p>
            <p>{comment.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add comment..."
          className="flex-1 bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-lg"
        />
        <button
          onClick={submitComment}
          className="bg-indigo-600 px-3 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
