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
    <div className="bg-white border border-zinc-200 p-10 mb-8">
      <h2 className="text-3xl font-poppins font-bold mb-8 text-emerald-950 tracking-tighter">Friend Profiles</h2>

      {friends.length > 0 && (
        <div className="mb-10 space-y-4">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-start justify-between p-6 bg-emerald-900/10 border border-zinc-200"
            >
              <div className="flex-1">
                <h3 className="text-xl font-poppins font-bold text-emerald-950 mb-3">{friend.name}</h3>
                <div className="text-sm space-y-2 font-source-sans">
                  <p><span className="font-poppins font-bold text-emerald-900 uppercase tracking-widest text-xs">Likes:</span> <span className="text-zinc-700">{friend.likes}</span></p>
                  {friend.dislikes && (
                    <p><span className="font-poppins font-bold text-red-900 uppercase tracking-widest text-xs">Dislikes:</span> <span className="text-zinc-700">{friend.dislikes}</span></p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 ml-6">
                {editingId !== friend.id && (
                  <>
                    <button
                      onClick={() => startEdit(friend)}
                      className="px-5 py-2 bg-white text-emerald-950 border border-zinc-300 font-poppins text-sm font-bold uppercase tracking-wider hover:bg-zinc-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemoveFriend(friend.id)}
                      className="px-5 py-2 bg-white text-red-900 border border-red-200 font-poppins text-sm font-bold uppercase tracking-wider hover:bg-red-50 transition-colors"
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
        <form onSubmit={handleAddOrUpdate} className="space-y-6 pt-6 border-t border-zinc-200">
          <div>
            <label className="block text-xs font-poppins font-bold text-zinc-500 mb-3 uppercase tracking-widest">
              {editingId ? 'Edit Profile' : ''}
            </label>
            <input
              type="text"
              placeholder="e.g., Sarah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-emerald-900/10 border border-zinc-200 text-emerald-950 font-source-sans focus:outline-none focus:border-beige focus:ring-1 focus:ring-beige transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-poppins font-bold text-emerald-900 mb-3 uppercase tracking-widest">
                What do they like?
              </label>
              <textarea
                placeholder="e.g., coffee, board games"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                rows={3}
                className="w-full px-5 py-4 bg-emerald-900/10 border border-zinc-200 text-emerald-950 font-source-sans focus:outline-none focus:border-beige focus:ring-1 focus:ring-beige transition-colors resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-poppins font-bold text-red-900 mb-3 uppercase tracking-widest">
                What do they dislike?
              </label>
              <textarea
                placeholder="e.g., hiking, loud music (Optional)"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                rows={3}
                className="w-full px-5 py-4 bg-emerald-900/10 border border-zinc-200 text-emerald-950 font-source-sans focus:outline-none focus:border-beige focus:ring-1 focus:ring-beige transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-4 px-6 bg-beige text-emerald-950 font-poppins font-bold uppercase tracking-widest text-sm hover:bg-beige-dark transition-colors"
            >
              {editingId ? 'Update Profile' : 'Add Profile'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-4 px-6 bg-white text-emerald-950 border border-zinc-300 font-poppins font-bold uppercase tracking-widest text-sm hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {friends.length >= 5 && !editingId && (
        <p className="text-center text-zinc-500 text-sm mt-6 font-source-sans font-medium uppercase tracking-widest">
          Capacity reached. Remove a profile to add another.
        </p>
      )}
    </div>
  )
}