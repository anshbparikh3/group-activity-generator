import { useState } from 'react'
import { Friend } from '@/app/page'

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
  const [interests, setInterests] = useState('')

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !interests.trim()) return

    if (editingId) {
      onUpdateFriend(editingId, { id: editingId, name, interests })
      setEditingId(null)
    } else {
      onAddFriend({ id: Date.now().toString(), name, interests })
    }

    setName('')
    setInterests('')
  }

  const startEdit = (friend: Friend) => {
    setEditingId(friend.id)
    setName(friend.name)
    setInterests(friend.interests)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setInterests('')
  }

  const canAddMore = friends.length < 5

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">👥 Add Friends & Their Interests</h2>

      {/* Friend List */}
      {friends.length > 0 && (
        <div className="mb-8 space-y-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{friend.name}</h3>
                <p className="text-gray-600 text-sm">{friend.interests}</p>
              </div>
              <div className="flex gap-2 ml-4">
                {editingId !== friend.id && (
                  <>
                    <button
                      onClick={() => startEdit(friend)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemoveFriend(friend.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
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

      {/* Add/Edit Form */}
      {(editingId || canAddMore) && (
        <form onSubmit={handleAddOrUpdate} className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {editingId ? 'Edit' : 'Friend'} Name
            </label>
            <input
              type="text"
              placeholder="e.g., Sarah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Interests & Preferences
            </label>
            <textarea
              placeholder="e.g., loves coffee, hates hiking, enjoys thrifting, vegan"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              {editingId ? 'Update Friend' : 'Add Friend'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {friends.length >= 5 && !editingId && (
        <p className="text-center text-gray-600 text-sm mt-4">
          Maximum 5 friends reached. Remove a friend to add another.
        </p>
      )}

      <p className="text-gray-600 text-sm mt-4">
        {friends.length === 0
          ? 'Add 2-5 friends to generate activities'
          : `${friends.length} friend${friends.length !== 1 ? 's' : ''} added (${friends.length}/5)`}
      </p>
    </div>
  )
}
