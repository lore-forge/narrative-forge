'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Users, 
  MessageSquare, 
  Share2,
  UserPlus,
  Crown,
  Eye,
  Edit,
  Lock,
  Unlock,
  Clock,
  Send,
  MoreVertical,
  Bell,
  BellOff,
  Settings
} from 'lucide-react'
import { RichTextEditor } from '@/components/editor/rich-text-editor'
import type { 
  CollaborativeSession, 
  Collaborator, 
  Comment, 
  Change,
  PermissionLevel 
} from '@/types'

interface CollaborativeEditorProps {
  storyId: string
  userId: string
  initialContent: string
  isOwner: boolean
  onContentChange: (content: string) => void
  onSave: () => void
}

interface EditorState {
  content: string
  cursors: Record<string, { position: number, user: Collaborator }>
  selection: { start: number, end: number } | null
  isLocked: boolean
  lockedBy?: Collaborator
}

export function CollaborativeEditor({
  storyId,
  userId,
  initialContent,
  isOwner,
  onContentChange,
  onSave
}: CollaborativeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)
  
  const [session, setSession] = useState<CollaborativeSession>({
    id: `session-${storyId}`,
    storyId,
    participants: [],
    createdAt: new Date(),
    isActive: true
  })
  
  const [editorState, setEditorState] = useState<EditorState>({
    content: initialContent,
    cursors: {},
    selection: null,
    isLocked: false
  })
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: userId,
      name: 'You',
      email: 'you@example.com',
      avatar: '/placeholder-avatar.jpg',
      role: isOwner ? 'owner' : 'editor',
      isOnline: true,
      lastSeen: new Date(),
      cursor: { position: 0, color: '#3b82f6' }
    }
  ])
  
  const [comments, setComments] = useState<Comment[]>([])
  const [changes, setChanges] = useState<Change[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showChanges, setShowChanges] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  useEffect(() => {
    // Mock WebSocket connection for real-time collaboration
    const mockCollaborators: Collaborator[] = [
      {
        id: 'user-2',
        name: 'Sarah Mitchell',
        email: 'sarah@example.com',
        avatar: '/placeholder-avatar-2.jpg',
        role: 'editor',
        isOnline: true,
        lastSeen: new Date(),
        cursor: { position: 150, color: '#ef4444' }
      },
      {
        id: 'user-3',
        name: 'Alex Chen',
        email: 'alex@example.com',
        avatar: '/placeholder-avatar-3.jpg',
        role: 'viewer',
        isOnline: false,
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        cursor: { position: 0, color: '#10b981' }
      }
    ]

    const mockComments: Comment[] = [
      {
        id: 'comment-1',
        userId: 'user-2',
        userName: 'Sarah Mitchell',
        content: 'I love this description! Maybe we could add more sensory details?',
        position: 245,
        timestamp: new Date(Date.now() - 120000),
        resolved: false
      },
      {
        id: 'comment-2',
        userId: 'user-3',
        userName: 'Alex Chen',
        content: 'This character development is really strong.',
        position: 580,
        timestamp: new Date(Date.now() - 300000),
        resolved: true,
        resolvedBy: userId,
        resolvedAt: new Date(Date.now() - 60000)
      }
    ]

    const mockChanges: Change[] = [
      {
        id: 'change-1',
        userId: 'user-2',
        userName: 'Sarah Mitchell',
        type: 'edit',
        description: 'Added dialogue to scene 3',
        timestamp: new Date(Date.now() - 180000),
        before: 'The character walked silently.',
        after: 'The character walked silently, pondering the mysterious message.'
      },
      {
        id: 'change-2',
        userId: userId,
        userName: 'You',
        type: 'addition',
        description: 'Added new paragraph',
        timestamp: new Date(Date.now() - 240000),
        before: '',
        after: 'A new chapter in their adventure was about to begin.'
      }
    ]

    setCollaborators(prev => [...prev, ...mockCollaborators])
    setComments(mockComments)
    setChanges(mockChanges)
  }, [userId])

  const handleContentChange = (content: string) => {
    setEditorState(prev => ({ ...prev, content }))
    onContentChange(content)
    
    // Simulate broadcasting change to other collaborators
    broadcastChange('edit', 'Content modified', editorState.content, content)
  }

  const broadcastChange = (type: Change['type'], description: string, before: string, after: string) => {
    const change: Change = {
      id: `change-${Date.now()}`,
      userId,
      userName: 'You',
      type,
      description,
      timestamp: new Date(),
      before,
      after
    }
    
    setChanges(prev => [change, ...prev])
  }

  const addComment = (position: number, content: string) => {
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId,
      userName: 'You',
      content,
      position,
      timestamp: new Date(),
      resolved: false
    }
    
    setComments(prev => [comment, ...prev])
  }

  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            resolved: true,
            resolvedBy: userId,
            resolvedAt: new Date()
          }
        : comment
    ))
  }

  const sendChatMessage = () => {
    if (!newMessage.trim()) return
    
    const message = {
      id: `msg-${Date.now()}`,
      userId,
      userName: 'You',
      content: newMessage,
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const inviteCollaborator = async () => {
    if (!inviteEmail.trim()) return
    
    // Mock invitation
    const newCollaborator: Collaborator = {
      id: `user-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      avatar: '/placeholder-avatar.jpg',
      role: 'editor',
      isOnline: false,
      lastSeen: new Date(),
      cursor: { position: 0, color: `#${Math.floor(Math.random()*16777215).toString(16)}` }
    }
    
    setCollaborators(prev => [...prev, newCollaborator])
    setInviteEmail('')
    setShowInviteDialog(false)
  }

  const changePermission = (collaboratorId: string, newRole: PermissionLevel) => {
    setCollaborators(prev => prev.map(collab =>
      collab.id === collaboratorId
        ? { ...collab, role: newRole }
        : collab
    ))
  }

  const lockEditor = () => {
    const currentUser = collaborators.find(c => c.id === userId)
    setEditorState(prev => ({
      ...prev,
      isLocked: true,
      lockedBy: currentUser
    }))
  }

  const unlockEditor = () => {
    setEditorState(prev => ({
      ...prev,
      isLocked: false,
      lockedBy: undefined
    }))
  }

  const onlineCollaborators = collaborators.filter(c => c.isOnline)
  const unresolvedComments = comments.filter(c => !c.resolved)

  return (
    <div className="h-screen flex">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Collaboration Header */}
        <Card className="rounded-none border-x-0 border-t-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-narrative-500" />
                  <span className="font-medium">Collaborative Editing</span>
                  {editorState.isLocked && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked by {editorState.lockedBy?.name}
                    </Badge>
                  )}
                </div>
                
                {/* Active Collaborators */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {onlineCollaborators.slice(0, 5).map((collaborator) => (
                      <Avatar 
                        key={collaborator.id} 
                        className="w-8 h-8 border-2 border-white dark:border-gray-800"
                      >
                        <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                        <AvatarFallback style={{ backgroundColor: collaborator.cursor?.color }}>
                          {collaborator.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {onlineCollaborators.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs">
                        +{onlineCollaborators.length - 5}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {onlineCollaborators.length} online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Action Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className={showComments ? 'bg-narrative-100 dark:bg-narrative-800' : ''}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Comments ({unresolvedComments.length})
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChanges(!showChanges)}
                  className={showChanges ? 'bg-narrative-100 dark:bg-narrative-800' : ''}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Changes
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChat(!showChat)}
                  className={showChat ? 'bg-narrative-100 dark:bg-narrative-800' : ''}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Chat
                </Button>

                {isOwner && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={editorState.isLocked ? unlockEditor : lockEditor}
                    >
                      {editorState.isLocked ? (
                        <>
                          <Unlock className="w-4 h-4 mr-1" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-1" />
                          Lock
                        </>
                      )}
                    </Button>

                    <Popover open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <UserPlus className="w-4 h-4 mr-1" />
                          Invite
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-3">
                          <h4 className="font-medium">Invite Collaborator</h4>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter email address"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && inviteCollaborator()}
                            />
                            <Button size="sm" onClick={inviteCollaborator}>
                              Send
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                )}

                <Button variant="outline" size="sm" onClick={onSave}>
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Editor */}
        <div className="flex-1 p-4">
          <RichTextEditor
            content={editorState.content}
            onChange={handleContentChange}
            context="story"
            onSave={onSave}
            autoSave={true}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Collaborators */}
        <Card className="rounded-none border-x-0 border-t-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Collaborators</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                          <AvatarFallback>{collaborator.name[0]}</AvatarFallback>
                        </Avatar>
                        {collaborator.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{collaborator.name}</p>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {collaborator.role === 'owner' && <Crown className="w-2 h-2 mr-1" />}
                            {collaborator.role === 'editor' && <Edit className="w-2 h-2 mr-1" />}
                            {collaborator.role === 'viewer' && <Eye className="w-2 h-2 mr-1" />}
                            {collaborator.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {isOwner && collaborator.id !== userId && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40" align="end">
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => changePermission(collaborator.id, 'editor')}
                              className="w-full justify-start"
                            >
                              <Edit className="w-3 h-3 mr-2" />
                              Editor
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => changePermission(collaborator.id, 'viewer')}
                              className="w-full justify-start"
                            >
                              <Eye className="w-3 h-3 mr-2" />
                              Viewer
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Comments Panel */}
        {showComments && (
          <Card className="rounded-none border-x-0 border-t-0 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Comments</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded border ${
                        comment.resolved
                          ? 'bg-gray-50 dark:bg-gray-800 opacity-75'
                          : 'bg-blue-50 dark:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.userName}</span>
                          <span className="text-xs text-gray-500">
                            {comment.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {!comment.resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveComment(comment.id)}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      {comment.resolved && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Resolved by {comment.resolvedBy === userId ? 'You' : 'Someone'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Changes Panel */}
        {showChanges && (
          <Card className="rounded-none border-x-0 border-t-0 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Changes</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {changes.map((change) => (
                    <div key={change.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{change.userName}</span>
                        <span className="text-xs text-gray-500">
                          {change.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {change.description}
                      </p>
                      <div className="text-xs space-y-1">
                        {change.before && (
                          <div className="text-red-600 dark:text-red-400">
                            - {change.before}
                          </div>
                        )}
                        {change.after && (
                          <div className="text-green-600 dark:text-green-400">
                            + {change.after}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Chat Panel */}
        {showChat && (
          <Card className="rounded-none border-x-0 border-t-0 flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Team Chat</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 flex-1 flex flex-col">
              <ScrollArea className="flex-1 h-32 mb-3">
                <div className="space-y-2">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.userName}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  ref={chatInputRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  className="flex-1"
                />
                <Button size="sm" onClick={sendChatMessage}>
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}