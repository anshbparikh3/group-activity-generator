import { useState } from 'react'
import { Friend } from '../app/type'

interface FriendFormProps {
  friends: Friend[]
  onAddFriend: (friend: Friend) => void
  onUpdateFriend: (id: string, friend: Friend) => void
  onRemoveFriend: (id: string) => void
}

export default function FriendForm({
  friends,
  onAddFriend,
  onUpdateFriend,
  onRemoveFriend,
}: FriendFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [likes, setLikes] = useState('')
  const [dislikes, setDislikes] = useState('')

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !likes.trim()) return

    if (editingId) {
      onUpdateFriend(editingId, { id: editingId, name, likes, dislikes })
      setEditingId(null)
    } else {
      onAddFriend({ id: Date.now().toString(), name, likes, dislikes })
    }

    setName('')
    setLikes('')
    setDislikes('')
  }

  const startEdit = (friend: Friend) => {
    setEditingId(friend.id)
    setName(friend.name)
    setLikes(friend.likes)
    setDislikes(friend.dislikes || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setLikes('')
    setDislikes('')
  }

  const canAddMore = friends.length < 5

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-100 tracking-tight">👥 Team Profiles</h2>

      {friends.length > 0 && (
        <div className="mb-8 space-y-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-start justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-200 mb-2">{friend.name}</h3>
                <div className="text-sm space-y-1.5">
                  <p><span className="font-semibold text-emerald-400">👍 Likes:</span> <span className="text-slate-300">{friend.likes}</span></p>
                  {friend.dislikes && (
                    <p><span className="font-semibold text-rose-400">👎 Dislikes:</span> <span className="text-slate-300">{friend.dislikes}</span></p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {editingId !== friend.id && (
                  <>
                    <button
                      onClick={() => startEdit(friend)}
                      className="px-3 py-1.5 bg-slate-700 text-slate-300 border border-slate-600 rounded text-sm font-semibold hover:bg-slate-600 hover:text-white transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemoveFriend(friend.id)}
                      className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded text-sm font-semibold hover:bg-rose-500/20 transition-all"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(editingId || canAddMore) && (
        <form onSubmit={handleAddOrUpdate} className="space-y-5 p-5 bg-slate-950/50 border border-slate-800/50 rounded-xl shadow-inner">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
              {editingId ? 'Edit Profile' : 'Profile Name'}
            </label>
            <input
              type="text"
              placeholder="e.g., Sarah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-600 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider">
                👍 What do they like?
              </label>
              <textarea
                placeholder="e.g., coffee, board games"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-600 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-rose-400 mb-2 uppercase tracking-wider">
                👎 What do they dislike?
              </label>
              <textarea
                placeholder="e.g., hiking, loud music (Optional)"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-slate-600 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"
            >
              {editingId ? 'Update Profile' : 'Add Profile'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-2 px-4 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg font-semibold hover:bg-slate-700 hover:text-white transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {friends.length >= 5 && !editingId && (
        <p className="text-center text-slate-500 text-sm mt-4 font-medium">
          Capacity reached. Remove a profile to add another.
        </p>
      )}
    </div>
  )
}