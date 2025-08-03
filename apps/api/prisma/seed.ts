import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { openid: 'sample_user_1' },
    update: {},
    create: {
      openid: 'sample_user_1',
      nickName: 'Chef John',
      avatarUrl: 'https://example.com/avatar1.jpg',
      gender: 1,
      country: 'China',
      province: 'Guangdong',
      city: 'Shenzhen'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { openid: 'sample_user_2' },
    update: {},
    create: {
      openid: 'sample_user_2',
      nickName: 'Kitchen Master',
      avatarUrl: 'https://example.com/avatar2.jpg',
      gender: 2,
      country: 'China',
      province: 'Beijing',
      city: 'Beijing'
    }
  });

  console.log('✅ Users created');

  // Create sample recipes
  const recipe1 = await prisma.recipe.upsert({
    where: { id: 'sample_recipe_1' },
    update: {},
    create: {
      id: 'sample_recipe_1',
      title: '经典红烧肉',
      coverImage: 'https://example.com/hongshao-rou.jpg',
      ingredients: [
        { name: '五花肉', amount: '500g', unit: '克', type: 'main' },
        { name: '生抽', amount: '2', unit: '勺', type: 'sauce' },
        { name: '老抽', amount: '1', unit: '勺', type: 'sauce' },
        { name: '料酒', amount: '2', unit: '勺', type: 'sauce' },
        { name: '冰糖', amount: '30g', unit: '克', type: 'main' },
        { name: '葱姜蒜', amount: '适量', unit: '', type: 'auxiliary' }
      ],
      sauce: [
        { name: '生抽', amount: '2', unit: '勺' },
        { name: '老抽', amount: '1', unit: '勺' },
        { name: '料酒', amount: '2', unit: '勺' },
        { name: '冰糖', amount: '30g', unit: '克' }
      ],
      steps: [
        {
          title: '焯水',
          time: 10,
          content: ['五花肉切成大块', '冷水下锅焯水', '去除血水和杂质']
        },
        {
          title: '炒糖色',
          time: 5,
          content: ['锅中放油', '放入冰糖小火炒至焦糖色']
        },
        {
          title: '上色',
          time: 3,
          content: ['放入五花肉翻炒上色']
        },
        {
          title: '调味',
          time: 2,
          content: ['加入生抽、老抽、料酒调味']
        },
        {
          title: '炖煮',
          time: 60,
          content: ['加入适量热水', '大火烧开后转小火炖煮1小时']
        },
        {
          title: '收汁',
          time: 10,
          content: ['收汁即可出锅']
        }
      ],
      tips: [
        '五花肉最好选择肥瘦相间的',
        '炒糖色时火候要控制好，避免糊掉',
        '炖煮时火候要小，让肉质更加软烂'
      ],
      description: '传统美味的红烧肉，肥而不腻，入口即化',
      cookingTime: 90,
      servings: 4,
      difficulty: 'medium',
      imageUrl: 'https://example.com/hongshao-rou.jpg',
      tags: ['红烧肉', '传统菜', '肉类'],
      isPublic: true,
      userId: user1.id
    }
  });

  const recipe2 = await prisma.recipe.upsert({
    where: { id: 'sample_recipe_2' },
    update: {},
    create: {
      id: 'sample_recipe_2',
      title: '清炒小白菜',
      coverImage: 'https://example.com/xiaobaicai.jpg',
      ingredients: [
        { name: '小白菜', amount: '300g', unit: '克', type: 'main' },
        { name: '蒜末', amount: '2', unit: '瓣', type: 'auxiliary' },
        { name: '盐', amount: '适量', unit: '', type: 'sauce' },
        { name: '食用油', amount: '1', unit: '勺', type: 'sauce' }
      ],
      sauce: [
        { name: '盐', amount: '适量', unit: '' },
        { name: '食用油', amount: '1', unit: '勺' }
      ],
      steps: [
        {
          title: '准备',
          time: 2,
          content: ['小白菜洗净', '切成段']
        },
        {
          title: '爆香',
          time: 1,
          content: ['锅中放油', '爆香蒜末']
        },
        {
          title: '翻炒',
          time: 5,
          content: ['放入小白菜翻炒', '加盐调味', '炒至菜叶变软即可']
        }
      ],
      tips: [
        '小白菜要选择新鲜的',
        '炒制时间不要太长，保持脆嫩口感',
        '蒜末要爆香出香味'
      ],
      description: '简单易做的家常素菜，营养丰富',
      cookingTime: 10,
      servings: 2,
      difficulty: 'easy',
      imageUrl: 'https://example.com/xiaobaicai.jpg',
      tags: ['素菜', '快手菜', '家常菜'],
      isPublic: true,
      userId: user2.id
    }
  });

  const recipe3 = await prisma.recipe.upsert({
    where: { id: 'sample_recipe_3' },
    update: {},
    create: {
      id: 'sample_recipe_3',
      title: '麻婆豆腐',
      coverImage: 'https://example.com/mapo-tofu.jpg',
      ingredients: [
        { name: '嫩豆腐', amount: '400g', unit: '克', type: 'main' },
        { name: '猪肉末', amount: '200g', unit: '克', type: 'main' },
        { name: '豆瓣酱', amount: '2', unit: '勺', type: 'sauce' },
        { name: '花椒', amount: '1', unit: '勺', type: 'sauce' },
        { name: '辣椒', amount: '适量', unit: '', type: 'auxiliary' },
        { name: '葱花', amount: '适量', unit: '', type: 'auxiliary' }
      ],
      sauce: [
        { name: '豆瓣酱', amount: '2', unit: '勺' },
        { name: '花椒', amount: '1', unit: '勺' },
        { name: '盐', amount: '适量', unit: '' }
      ],
      steps: [
        {
          title: '准备',
          time: 5,
          content: ['豆腐切成小块', '猪肉末腌制']
        },
        {
          title: '爆香',
          time: 2,
          content: ['锅中放油', '爆香豆瓣酱和花椒']
        },
        {
          title: '炒肉',
          time: 3,
          content: ['放入猪肉末翻炒至变色']
        },
        {
          title: '加豆腐',
          time: 2,
          content: ['加入豆腐块', '轻轻翻炒']
        },
        {
          title: '炖煮',
          time: 5,
          content: ['加入适量水', '小火炖煮5分钟']
        },
        {
          title: '出锅',
          time: 1,
          content: ['撒上葱花即可出锅']
        }
      ],
      tips: [
        '豆腐要选择嫩豆腐，口感更好',
        '炒制时动作要轻，避免豆腐碎掉',
        '花椒要炒出香味'
      ],
      description: '川菜经典，麻辣鲜香，下饭神器',
      cookingTime: 20,
      servings: 3,
      difficulty: 'medium',
      imageUrl: 'https://example.com/mapo-tofu.jpg',
      tags: ['川菜', '豆腐', '麻辣'],
      isPublic: true,
      userId: user1.id
    }
  });

  const recipe4 = await prisma.recipe.upsert({
    where: { id: 'sample_recipe_4' },
    update: {},
    create: {
      id: 'sample_recipe_4',
      title: '隋卞做带鱼',
      coverImage: 'https://example.com/daiyu.jpg',
      ingredients: [
        { name: '带鱼', amount: '500g', unit: '克', type: 'main' },
        { name: '花雕酒', amount: '25g', unit: '克', type: 'sauce' },
        { name: '食用油', amount: '130g', unit: '克', type: 'sauce' },
        { name: '蒜', amount: '30g', unit: '克', type: 'auxiliary' },
        { name: '姜', amount: '30g', unit: '克', type: 'auxiliary' },
        { name: '花椒', amount: '10g', unit: '克', type: 'sauce' },
        { name: '干辣椒段', amount: '150g', unit: '克', type: 'auxiliary' },
        { name: '葱花', amount: '30g', unit: '克', type: 'auxiliary' },
        { name: '花生米', amount: '80g', unit: '克', type: 'auxiliary' },
        { name: '淀粉', amount: '5g', unit: '克', type: 'sauce' },
        { name: '酱油', amount: '50g', unit: '克', type: 'sauce' },
        { name: '米醋', amount: '50g', unit: '克', type: 'sauce' },
        { name: '白糖', amount: '80g', unit: '克', type: 'sauce' },
        { name: '味精', amount: '1g', unit: '克', type: 'sauce' },
        { name: '料酒', amount: '10g', unit: '克', type: 'sauce' }
      ],
      sauce: [
        { name: '花雕酒', amount: '25g', unit: '克' },
        { name: '食用油', amount: '130g', unit: '克' },
        { name: '花椒', amount: '10g', unit: '克' },
        { name: '淀粉', amount: '5g', unit: '克' },
        { name: '酱油', amount: '50g', unit: '克' },
        { name: '米醋', amount: '50g', unit: '克' },
        { name: '白糖', amount: '80g', unit: '克' },
        { name: '味精', amount: '1g', unit: '克' },
        { name: '料酒', amount: '10g', unit: '克' }
      ],
      steps: [
        {
          title: '处理带鱼',
          time: 5,
          content: ['带鱼洗净后打上花刀', '用清水冲去一部分腥味']
        },
        {
          title: '腌制',
          time: 10,
          content: ['加入花雕酒腌制去腥', '用厨房纸将表面水分吸干']
        },
        {
          title: '煎制',
          time: 8,
          content: ['热锅加油（六七成热）', '放入带鱼煎至表面定型、颜色微黄', '翻面煎至颜色加深']
        },
        {
          title: '炒香配料',
          time: 3,
          content: ['将带鱼推至锅的一边', '倾斜锅，在空的一边加入蒜炒至微黄', '加入花椒炒香']
        },
        {
          title: '加入辣椒',
          time: 2,
          content: ['加入姜片与干辣椒段', '炒至辣椒变色出香味']
        },
        {
          title: '翻炒',
          time: 1,
          content: ['将锅放平', '与带鱼一起翻炒均匀']
        },
        {
          title: '调味',
          time: 1,
          content: ['将调好的汁（兑入淀粉）搅拌均匀后倒入锅中', '快速翻炒，使带鱼均匀裹上酱汁']
        },
        {
          title: '出锅',
          time: 1,
          content: ['倒入葱花与花生米', '再次翻炒均匀，即可出锅装盘']
        }
      ],
      tips: [
        '带鱼要选择新鲜的，肉质紧实',
        '煎制时火候要控制好，避免糊掉',
        '辣椒要炒出香味但不要糊掉',
        '最后翻炒要快，避免带鱼碎掉'
      ],
      description: '经典带鱼做法，外酥内嫩，麻辣鲜香',
      cookingTime: 30,
      servings: 4,
      difficulty: 'medium',
      imageUrl: 'https://example.com/daiyu.jpg',
      tags: ['带鱼', '海鲜', '麻辣', '家常菜'],
      isPublic: true,
      userId: user1.id
    }
  });

  const recipe5 = await prisma.recipe.upsert({
    where: { id: 'sample_recipe_5' },
    update: {},
    create: {
      "id": "sample_recipe_5",
      "title": "乌发养生豆浆食谱",
      "description": "一款适合日常养发、补肾养血的健康饮品，选用黑色食材与坚果搭配，营养丰富，口感香浓。",
      "ingredients": [
        {
          "name": "黑豆",
          "amount": "10g",
          "unit": "g"
        },
        {
          "name": "黑芝麻",
          "amount": "5g",
          "unit": "g"
        },
        {
          "name": "花生",
          "amount": "10g",
          "unit": "g"
        },
        {
          "name": "红枣",
          "amount": "2颗",
          "unit": "颗"
        },
        {
          "name": "清水",
          "amount": "300ml",
          "unit": "ml"
        }
      ],
      "sauce": [],
      "steps": [
        {
          "title": "步骤 1",
          "content": [
            "**提前浸泡**（推荐）： 黑豆、花生提前浸泡 6~8 小时，黑芝麻可不用泡。 红枣去核备用。"
          ]
        },
        {
          "title": "步骤 2",
          "content": [
            "**放入豆浆机/破壁机**： 将所有食材和 300ml 水倒入机器中。"
          ]
        },
        {
          "title": "步骤 3",
          "content": [
            "**选择程序**： 启动\"豆浆\"或\"营养糊\"程序（约25分钟）。"
          ]
        },
        {
          "title": "步骤 4",
          "content": [
            "**过滤（可选）**： 打好的豆浆根据个人口感可过滤掉渣滓。"
          ]
        },
        {
          "title": "步骤 5",
          "content": [
            "**加热或保温**： 若未自动加热，请煮沸后饮用。"
          ]
        }
      ],
      "tips": [
        {
          "content": "可根据个人口味加入适量冰糖或蜂蜜调味。"
        },
        {
          "content": "红枣有甜味，若不喜甜可减少。"
        },
        {
          "content": "有破壁功能的机器能保留更多膳食纤维。"
        }
      ],
      "tags": [],
      "userId": user1.id
    }
  })

  console.log('✅ Recipes created');
  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 