import { Component } from 'react'
import { View } from '@tarojs/components'
import TailwindDemo from '../../components/tailwind-demo/index'
import './index.scss'

export default class TailwindDemoPage extends Component {

  render() {
    return (
      <View className='tailwind-demo-page'>
        <TailwindDemo />
      </View>
    )
  }
} 