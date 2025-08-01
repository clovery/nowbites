import { Component } from 'react'
import { View, Text, ScrollView, Button, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface GroupMember {
  id: string
  nickname: string
  avatar: string
  joinTime: string
  isOwner?: boolean
}

interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  createTime: string
  inviteCode: string
}

interface State {
  currentGroup: Group | null
  members: GroupMember[]
  inviteCode: string
  joinCode: string
  showCreateGroup: boolean
  groupName: string
  groupDescription: string
  userInfo: any
}

export default class GroupPage extends Component<{}, State> {

  constructor(props: {}) {
    super(props)
    this.state = {
      currentGroup: null,
      members: [],
      inviteCode: '',
      joinCode: '',
      showCreateGroup: false,
      groupName: '',
      groupDescription: '',
      userInfo: null
    }
  }

  componentDidMount() {
    // Check if user info exists in storage first
    const userInfo = Taro.getStorageSync('userInfo')
    if (userInfo) {
      this.setState({ userInfo })
    }
    this.loadGroupInfo()
  }

  getUserInfo = () => {
    // 获取用户信息 - 只在用户点击按钮时调用
    Taro.getUserProfile({
      desc: '用于群组功能显示用户信息',
      success: (res) => {
        this.setState({ userInfo: res.userInfo })
        Taro.setStorageSync('userInfo', res.userInfo)
      },
      fail: (err) => {
        console.log('获取用户信息失败', err)
        Taro.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    })
  }

  loadGroupInfo = () => {
    const currentGroup = Taro.getStorageSync('currentGroup')
    const members = Taro.getStorageSync('groupMembers') || []
    
    this.setState({
      currentGroup,
      members
    })
  }

  generateInviteCode = () => {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase()
    return code
  }

  createGroup = () => {
    const { groupName, groupDescription, userInfo } = this.state
    
    if (!groupName.trim()) {
      Taro.showToast({
        title: '请输入群组名称',
        icon: 'none'
      })
      return
    }
    
    if (!userInfo) {
      Taro.showToast({
        title: '请先授权获取用户信息',
        icon: 'none'
      })
      return
    }
    
    const inviteCode = this.generateInviteCode()
    const group: Group = {
      id: Date.now().toString(),
      name: groupName,
      description: groupDescription,
      memberCount: 1,
      createTime: new Date().toISOString(),
      inviteCode
    }
    
    const owner: GroupMember = {
      id: 'owner_' + Date.now(),
      nickname: userInfo.nickName,
      avatar: userInfo.avatarUrl,
      joinTime: new Date().toISOString(),
      isOwner: true
    }
    
    // 保存群组信息
    Taro.setStorageSync('currentGroup', group)
    Taro.setStorageSync('groupMembers', [owner])
    
    this.setState({
      currentGroup: group,
      members: [owner],
      showCreateGroup: false,
      groupName: '',
      groupDescription: ''
    })
    
    Taro.showToast({
      title: '群组创建成功',
      icon: 'success'
    })
  }

  joinGroup = () => {
    const { joinCode, userInfo } = this.state
    
    if (!joinCode.trim()) {
      Taro.showToast({
        title: '请输入邀请码',
        icon: 'none'
      })
      return
    }
    
    if (!userInfo) {
      Taro.showToast({
        title: '请先授权获取用户信息',
        icon: 'none'
      })
      return
    }
    
    // 模拟加入群组（实际应用中需要服务器验证）
    const mockGroup: Group = {
      id: 'group_' + joinCode,
      name: '美食分享群',
      description: '一起分享美食制作心得',
      memberCount: 3,
      createTime: new Date().toISOString(),
      inviteCode: joinCode
    }
    
    const newMember: GroupMember = {
      id: 'member_' + Date.now(),
      nickname: userInfo.nickName,
      avatar: userInfo.avatarUrl,
      joinTime: new Date().toISOString()
    }
    
    const existingMembers = [
      {
        id: 'owner_123',
        nickname: '群主',
        avatar: '/assets/default-avatar.png',
        joinTime: new Date(Date.now() - 86400000).toISOString(),
        isOwner: true
      },
      {
        id: 'member_456',
        nickname: '美食达人',
        avatar: '/assets/default-avatar.png',
        joinTime: new Date(Date.now() - 43200000).toISOString()
      }
    ]
    
    const allMembers = [...existingMembers, newMember]
    
    Taro.setStorageSync('currentGroup', mockGroup)
    Taro.setStorageSync('groupMembers', allMembers)
    
    this.setState({
      currentGroup: mockGroup,
      members: allMembers,
      joinCode: ''
    })
    
    Taro.showToast({
      title: '加入群组成功',
      icon: 'success'
    })
  }

  copyInviteCode = () => {
    const { currentGroup } = this.state
    if (!currentGroup) return
    
    Taro.setClipboardData({
      data: currentGroup.inviteCode,
      success: () => {
        Taro.showToast({
          title: '邀请码已复制',
          icon: 'success'
        })
      }
    })
  }

  shareGroup = () => {
    const { currentGroup } = this.state
    if (!currentGroup) return
    
    Taro.showShareMenu({
      withShareTicket: true
      // Remove the menus property as it doesn't exist in the Option type
    })
  }

  leaveGroup = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出当前群组吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('currentGroup')
          Taro.removeStorageSync('groupMembers')
          
          this.setState({
            currentGroup: null,
            members: []
          })
          
          Taro.showToast({
            title: '已退出群组',
            icon: 'success'
          })
        }
      }
    })
  }

  formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return '今天加入'
    } else if (days === 1) {
      return '昨天加入'
    } else {
      return `${days}天前加入`
    }
  }

  render() {
    const { 
      currentGroup, 
      members, 
      showCreateGroup, 
      groupName, 
      groupDescription, 
      joinCode,
      userInfo
    } = this.state

    if (!currentGroup) {
      return (
        <View className='group-page'>
          <View className='header'>
            <Text className='title'>群组分享</Text>
            <Text className='subtitle'>邀请朋友一起分享菜谱</Text>
          </View>

          {!userInfo && (
            <View className='auth-section'>
              <View className='auth-card'>
                <Text className='auth-title'>需要授权用户信息</Text>
                <Text className='auth-desc'>为了更好的群组体验，需要获取您的昵称和头像</Text>
                <Button className='auth-btn' onClick={this.getUserInfo}>
                  授权用户信息
                </Button>
              </View>
            </View>
          )}

          {userInfo && (
            <View className='no-group'>
              <View className='no-group-content'>
                <View className='no-group-icon'>👥</View>
                <Text className='no-group-title'>还没有加入群组</Text>
                <Text className='no-group-desc'>创建或加入群组，与朋友分享美食制作心得</Text>
                
                <View className='group-actions'>
                  <Button 
                    className='action-btn primary'
                    onClick={() => this.setState({ showCreateGroup: true })}
                  >
                    创建群组
                  </Button>
                  
                  <View className='join-section'>
                    <Input
                      className='join-input'
                      placeholder='输入邀请码'
                      value={joinCode}
                      onInput={(e) => this.setState({ joinCode: e.detail.value })}
                    />
                    <Button className='join-btn' onClick={this.joinGroup}>
                      加入群组
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          )}

          {showCreateGroup && (
            <View className='create-group-modal'>
              <View className='modal-content'>
                <View className='modal-header'>
                  <Text className='modal-title'>创建群组</Text>
                  <Text 
                    className='modal-close'
                    onClick={() => this.setState({ showCreateGroup: false })}
                  >
                    ×
                  </Text>
                </View>
                
                <View className='form-group'>
                  <Text className='form-label'>群组名称</Text>
                  <Input
                    className='form-input'
                    placeholder='请输入群组名称'
                    value={groupName}
                    onInput={(e) => this.setState({ groupName: e.detail.value })}
                  />
                </View>
                
                <View className='form-group'>
                  <Text className='form-label'>群组描述</Text>
                  <Input
                    className='form-input'
                    placeholder='请输入群组描述（可选）'
                    value={groupDescription}
                    onInput={(e) => this.setState({ groupDescription: e.detail.value })}
                  />
                </View>
                
                <View className='modal-actions'>
                  <Button 
                    className='modal-btn secondary'
                    onClick={() => this.setState({ showCreateGroup: false })}
                  >
                    取消
                  </Button>
                  <Button className='modal-btn primary' onClick={this.createGroup}>
                    创建
                  </Button>
                </View>
              </View>
            </View>
          )}
        </View>
      )
    }

    return (
      <View className='group-page'>
        <View className='group-header'>
          <View className='group-info'>
            <Text className='group-name'>{currentGroup.name}</Text>
            <Text className='group-desc'>{currentGroup.description}</Text>
            <Text className='group-stats'>{members.length} 位成员</Text>
          </View>
          
          <View className='group-actions'>
            <Button className='header-btn' onClick={this.copyInviteCode}>
              复制邀请码
            </Button>
            <Button className='header-btn' onClick={this.shareGroup}>
              分享群组
            </Button>
          </View>
        </View>

        <View className='invite-section'>
          <View className='invite-card'>
            <Text className='invite-title'>邀请朋友加入</Text>
            <View className='invite-code-display'>
              <Text className='invite-code'>{currentGroup.inviteCode}</Text>
              <Text className='copy-btn' onClick={this.copyInviteCode}>复制</Text>
            </View>
            <Text className='invite-tip'>分享此邀请码给朋友，让他们加入群组</Text>
          </View>
        </View>

        <View className='members-section'>
          <Text className='section-title'>群组成员 ({members.length})</Text>
          <ScrollView className='members-list' scrollY>
            {members.map(member => (
              <View key={member.id} className='member-item'>
                <Image 
                  className='member-avatar' 
                  src={member.avatar || '/assets/default-avatar.png'}
                />
                <View className='member-info'>
                  <View className='member-name-row'>
                    <Text className='member-name'>{member.nickname}</Text>
                    {member.isOwner && (
                      <Text className='owner-badge'>群主</Text>
                    )}
                  </View>
                  <Text className='member-time'>{this.formatTime(member.joinTime)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className='bottom-actions'>
          <Button className='leave-btn' onClick={this.leaveGroup}>
            退出群组
          </Button>
        </View>
      </View>
    )
  }
}