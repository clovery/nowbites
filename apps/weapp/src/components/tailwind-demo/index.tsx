import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
import './index.scss'

export default class TailwindDemo extends Component {

  render() {
    return (
      <View className='tailwind-demo'>
        {/* Basic Tailwind Classes */}
        <View className='text-center mb-8'>
          <Text className='text-3xl font-bold text-blue-600 mb-4'>
            Tailwind CSS Demo
          </Text>
          <Text className='text-gray-600 text-lg'>
            Welcome to Tailwind CSS in Taro WeChat Mini Program!
          </Text>
        </View>

        {/* Flexbox Layout */}
        <View className='flex flex-col space-y-4 mb-8'>
          <View className='bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-lg'>
            <Text className='text-white text-xl font-semibold'>
              Gradient Background
            </Text>
            <Text className='text-white opacity-90 mt-2'>
              Beautiful gradient backgrounds with Tailwind CSS
            </Text>
          </View>

          <View className='bg-white p-6 rounded-lg shadow-md border border-gray-200'>
            <Text className='text-gray-800 text-lg font-medium mb-2'>
              Card Component
            </Text>
            <Text className='text-gray-600'>
              Clean card design with shadows and borders
            </Text>
          </View>
        </View>

        {/* Grid Layout */}
        <View className='grid grid-cols-2 gap-4 mb-8'>
          <View className='bg-green-500 p-4 rounded-lg'>
            <Text className='text-white text-center font-medium'>
              Grid Item 1
            </Text>
          </View>
          <View className='bg-blue-500 p-4 rounded-lg'>
            <Text className='text-white text-center font-medium'>
              Grid Item 2
            </Text>
          </View>
          <View className='bg-yellow-500 p-4 rounded-lg'>
            <Text className='text-white text-center font-medium'>
              Grid Item 3
            </Text>
          </View>
          <View className='bg-red-500 p-4 rounded-lg'>
            <Text className='text-white text-center font-medium'>
              Grid Item 4
            </Text>
          </View>
        </View>

        {/* Responsive Design */}
        <View className='bg-gray-100 p-6 rounded-lg mb-8'>
          <Text className='text-gray-800 text-lg font-medium mb-4'>
            Responsive Design
          </Text>
          <View className='flex flex-wrap gap-2'>
            <View className='bg-indigo-500 text-white px-3 py-2 rounded text-sm'>
              Small
            </View>
            <View className='bg-purple-500 text-white px-4 py-2 rounded'>
              Medium
            </View>
            <View className='bg-pink-500 text-white px-6 py-3 rounded-lg text-lg'>
              Large
            </View>
          </View>
        </View>

        {/* Custom Values */}
        <View className='mb-8'>
          <Text className='text-[#acc855] text-[100px] text-center block mb-4'>
            Custom Colors & Sizes
          </Text>
          <Text className='text-[#ff6b6b] text-[50px] text-center block'>
            Another Custom Style
          </Text>
        </View>

        {/* Interactive Elements */}
        <View className='space-y-4'>
          <Button className='w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200'>
            Primary Button
          </Button>
          
          <Button className='w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200'>
            Success Button
          </Button>
          
          <Button className='w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200'>
            Danger Button
          </Button>
        </View>
      </View>
    )
  }
} 