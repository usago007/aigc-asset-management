import type {
  Customer, Brand, Project, Brief, Task, Review,
  KeyFrame, Shot, Asset, GenerationVersion, Role,
  ProjectStage, RiskLevel, GenerationStatus, AssetStatus,
  TaskStatus, TaskType, ReviewStatus, ReviewType, Visibility,
} from '@/types'
import type { ImageGenerationTask, VideoGenerationTask, TaskQueueStatus, GenerationMode, ImageGenerationMode } from '@/types/generation'

const COSMETIC_IMAGES = [
  'https://images.unsplash.com/photo-1596462502278-27bfd94789203?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd0255?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1583209814683-c023dd293cc5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1590156546945-ce18b6b7e4b6?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae45?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1583209814683-c023dd293cc5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1570194065650-d765ef3b8525?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1587671932754-c95c2b38dd57?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1596462502278-27bfd94789203?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba7c2?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571875257727-256c32705685?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1583209814683-c023dd293cc5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1556228720-4d6c02c34b25?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571875257727-256c32705685?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1596462502278-27bfd94789203?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1583209814683-c023dd293cc5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1590156546945-ce18b6b7e4b6?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1570194065650-d765ef3b8525?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba7c2?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1587671932754-c95c2b38dd57?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop',
]

const CUSTOMER_NAMES = [
  '华美集团', '星辰科技', '绿意生活', '美妆时代', '雅诗集团',
  '兰蔻中国', '欧莱雅集团', '资生堂中国', 'SK-II中国', '香奈儿美妆',
  '迪奥中国', '娇兰中国', '碧欧泉中国', '科颜氏中国', '悦木之源',
  '倩碧中国', '玉兰油中国', '珀莱雅', '佰草集', '百雀羚',
  '完美日记', '花西子', '橘朵', '毛戈平', '卡姿兰',
  '玛丽黛佳', '自然堂', '丸美', '韩束', '薇诺娜',
  'HFP', '润百颜', '夸迪', '颐莲', '瑷尔博士',
]

const CONTACT_PERSONS = [
  '张经理', '李总监', '王女士', '赵总', '刘经理',
  '陈主管', '周总监', '黄经理', '林总监', '吴主管',
  '郑总监', '孙经理', '马主管', '朱总监', '胡经理',
  '郭总监', '何主管', '高经理', '罗总监', '梁主管',
  '宋经理', '谢总监', '唐主管', '许经理', '韩总监',
  '冯主管', '曹经理', '邓总监', '萧主管', '程经理',
  '蔡总监', '贾主管', '潘经理', '董总监', '袁主管',
]

const ROLE_COMBOS = [
  ['项目经理'], ['创意人员'], ['审核人员'],
  ['项目经理', '创意人员'], ['创意人员', '审核人员'],
  ['项目经理', '审核人员'], ['项目经理', '创意人员', '审核人员'],
]

const BRAND_NAMES = [
  '雅诗兰黛', '兰蔻', '迪奥', '香奈儿', 'SK-II',
  '资生堂', '欧莱雅', '玉兰油', '倩碧', '娇韵诗',
  '碧欧泉', '科颜氏', '悦木之源', '娇兰', '海蓝之谜',
  '赫莲娜', '阿玛尼', '纪梵希', '圣罗兰', '迪奥美妆',
  '植村秀', 'NARS', 'MAC', '芭比布朗', 'benefit',
  'Fresh', '馥蕾诗', '伊索', '欧舒丹', '祖玛珑',
  '潘海利根', 'Byredo', 'TF美妆', 'CPB', 'The Ordinary',
]

const BRAND_INDUSTRIES = [
  '护肤品', '彩妆', '香水', '个人护理', '男士护理',
  '母婴护肤', '敏感肌专用', '抗衰老', '防晒', '面膜',
  '唇部护理', '眼部护理', '身体护理', '美发护发', '口腔护理',
]

const BRAND_OWNERS = [
  '张伟', '李娜', '王芳', '赵敏', '刘洋',
  '陈晨', '周蕾', '黄磊', '林峰', '吴倩',
  '郑爽', '孙俪', '马超', '朱丹', '胡歌',
  '郭碧', '何炅', '高圆圆', '罗晋', '梁朝',
  '宋茜', '谢娜', '唐嫣', '许嵩', '韩雪',
  '冯绍', '曹格', '邓超', '萧亚', '程潇',
]

const PROJECT_NAMES = [
  '2024春季护肤新品广告', '夏日防晒 Campaign', '秋冬彩妆系列', '男士护肤升级', '抗老精华发布',
  '面膜品牌推广', '口红新品上市', '香水节日促销', '粉底液产品视频', '精华套装推广',
  '眼部护理系列', '身体乳广告', '防晒霜夏季推广', '洁面乳产品页', '化妆水宣传',
  '卸妆产品推广', '隔离霜上市', '腮红新品发布', '遮瑕产品视频', '眉笔宣传',
  '睫毛膏推广', '眼影盘发布', '唇釉新品上市', '护手霜广告', '洗发水推广',
  '沐浴露宣传', '护发素视频', '面膜产品页', '精华液推广', '面霜广告',
  '防晒霜冬季版', '粉底新品视频', '散粉发布', '高光产品页', '修容推广',
]

const PROJECT_STAGES: ProjectStage[] = ['Planning', 'InProduction', 'Review', 'Completed']
const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High']

const SHOT_NAMES = [
  '开场镜头-产品特写', '成分展示-实验室', '模特使用场景', '效果对比镜头', '品牌LOGO结尾',
  '开场-品牌故事', '质地展示-涂抹', '使用前后面部对比', '产品包装展示', '成分动画演示',
  '模特微笑使用', '实验室研发背景', '自然环境拍摄', '城市街头场景', 'SPA体验氛围',
  '水滴质地特写', '泡沫质感展示', '喷雾使用瞬间', '涂抹均匀过程', '吸收效果展示',
  '光泽感面部特写', '水润感对比', '紧致提拉演示', '美白效果展示', '淡斑前后对比',
  '防晒效果测试', '控油效果展示', '保湿水润测试', '修护效果演示', '抗皱效果对比',
  '清洁力展示', '卸妆效果测试', '彩妆持久度', '唇色显色度', '眼影晕染效果',
]

const SHOT_DESCRIPTIONS = [
  '缓慢推近，展示产品正面细节', '模特微笑使用产品，自然光线下拍摄', '实验室环境下展示产品质地和成分',
  '使用前后面部对比，高清特写', '品牌LOGO缓缓出现，背景虚化', '产品在水滴中的慢镜头',
  '模特在自然环境中使用产品', '成分分子动画与实际画面融合', '多角度展示产品包装和质感',
  'SPA环境下展示产品使用场景', '城市街头模特自然使用产品', '产品喷雾使用瞬间的捕捉',
  '手指涂抹产品的细腻过程', '面部光泽感的特写展示', '水润感的光影效果呈现',
]

const KEYFRAME_NAMES = [
  '开场-产品特写', '结尾-品牌LOGO', '场景-实验室', '氛围-SPA体验', '对比-使用前后',
  '开场-模特微笑', '场景-自然光线下', '对比-质地展示', '结尾-成分列表', '开场-水滴效果',
  '结尾-产品包装', '场景-城市街头', '对比-水润感', '开场-泡沫质感', '结尾-使用建议',
  '场景-海边拍摄', '对比-防晒效果', '开场-喷雾瞬间', '结尾-购买链接', '场景-室内布景',
  '对比-美白效果', '开场-唇色展示', '结尾-品牌宣言', '场景-花园拍摄', '对比-淡斑效果',
  '开场-眼影晕染', '结尾-活动信息', '场景-工作室拍摄', '对比-控油效果', '开场-睫毛特写',
  '结尾-扫码关注', '场景-影棚灯光', '对比-持久度测试', '开场-香水喷雾', '结尾-限时优惠',
]

const ASSET_NAMES = [
  '产品渲染图-高清', '模特精修图', '成分信息图', '效果对比图', '品牌VI元素',
  '产品3D模型', '宣传视频素材', '口红色号展示', '香水产品摄影', '面膜使用场景',
  '精华液质地图', '防晒霜SPF测试', '洗面奶泡沫图', '化妆水质地图', '卸妆效果对比',
  '隔离霜色号图', '腮红晕染效果', '遮瑕前后对比', '眉笔描摹图', '睫毛膏浓密度',
  '眼影盘试色图', '唇釉显色度图', '护手霜质地图', '洗发水效果', '沐浴露泡沫图',
  '护发素柔顺图', '面膜成分解析', '精华液吸收图', '面霜滋润图', '防晒霜水润图',
  '粉底液色号卡', '散粉定妆效果', '高光闪耀图', '修容对比图', '彩妆合集',
]

const ASSET_TYPES: ('Image' | 'Video' | 'Script')[] = ['Image', 'Video', 'Script']
const ASSET_FORMATS_MAP: Record<string, string[]> = { Image: ['PNG', 'JPG'], Video: ['MP4', 'MOV'], Script: ['PDF', 'DOCX'] }

const BRIEF_TITLES = [
  'Q1护肤广告Brief', '夏日彩妆Brief', '新品发布Brief', '节日促销Brief', '社交媒体Brief',
  '电商平台Brief', '线下活动Brief', 'KOL合作Brief', '品牌形象Brief', '产品详情页Brief',
  '短视频脚本Brief', '直播素材Brief', '海报设计Brief', 'H5页面Brief', '小程序Brief',
  '微信推文Brief', '微博话题Brief', '抖音挑战Brief', '小红书种草Brief', 'B站内容Brief',
  '年度品牌Brief', '季度campaign', '联名活动Brief', '会员营销Brief', '拉新活动Brief',
  '复购营销Brief', 'VIP专属Brief', '新品试用Brief', '体验官招募Brief', '口碑营销Brief',
  '内容矩阵Brief', '整合营销Brief', '品效合一Brief', '私域运营Brief', '公域引流Brief',
]

const BRIEF_DESCRIPTIONS = [
  '针对25-35岁都市女性，推广春季新品护肤系列', '夏日防晒产品推广，突出轻薄不油腻特点', '秋冬彩妆系列发布，主打温暖色调',
  '男士护肤品牌升级，吸引年轻男性消费者', '抗衰老精华新品发布，强调科技护肤', '敏感肌专用产品线推广',
  '彩妆品牌社交媒体 Campaign', '护肤品电商平台大促活动', '香水新品上市宣传', '个人护理品牌年度推广',
]

const TARGET_AUDIENCES = [
  '25-35岁都市女性', '18-25岁年轻群体', '30-45岁成熟女性', '男性护肤爱好者', '敏感肌人群',
  '彩妆爱好者', '护肤达人', '时尚达人', 'KOL/KOC', '品牌会员',
]

const PLATFORMS = [
  '抖音', '小红书', '微博', '微信', 'B站',
  '淘宝', '京东', '天猫', '得物', '快手',
]

const TASK_NAMES = [
  '视频剪辑-初版', '特效制作-粒子效果', '配音录制-中文', '字幕翻译-英文', '调色处理-暖色调',
  '片头动画制作', '片尾字幕设计', 'BGM选择与授权', '产品3D建模', '场景搭建',
  '模特拍摄安排', '后期精修', '音效设计', '转场效果制作', 'LOGO动画',
  '色彩校正', '画面稳定处理', '慢动作效果', '文字动画设计', '数据可视化图表',
  '多平台适配剪辑', '竖版短视频制作', '横版长视频制作', '方形图裁剪', 'GIF动图制作',
  '封面图设计', '缩略图优化', '水印添加', '版权素材替换', '多语言字幕',
  '音频降噪处理', '画面色彩增强', '动态贴纸添加', '互动元素设计', 'A/B版本制作',
]

const ASSIGNEES = [
  '张剪辑师', '李设计师', '王特效', '赵配音', '刘后期',
  '陈动画', '周调色', '黄音效', '林摄像', '吴导演',
  '郑剪辑', '孙设计', '马特效', '朱配音', '胡后期',
  '郭动画', '何调色', '高音效', '罗摄像', '梁导演',
  '宋剪辑', '谢设计', '唐特效', '许配音', '韩后期',
  '冯动画', '曹调色', '邓音效', '萧摄像', '程导演',
]

const TASK_TYPES: TaskType[] = ['生成', '审核', '交付']
const TASK_STATUSES: TaskStatus[] = ['Pending', 'InProgress', 'Completed']

const REVIEW_TARGETS = [
  'V1初版审核', '客户反馈修改', '最终版本确认', '内部审核', '质量检查',
  '色彩审核', '内容合规审核', '品牌一致性审核', '技术规格审核', '法律合规审核',
  '多语言版本审核', '平台适配审核', '无障碍审核', 'SEO优化审核', '转化率审核',
  '用户体验审核', '加载速度审核', '交互设计审核', '视觉层次审核', '信息架构审核',
  '文案审核', '翻译质量审核', '配音质量审核', '音效质量审核', '画面质量审核',
  '动画流畅度审核', '转场效果审核', '字幕准确性审核', '时间轴审核', '帧率审核',
  '分辨率审核', '色彩空间审核', '音频采样审核', '文件格式审核', '文件大小审核',
]

const REVIEWERS = [
  '张审核员', '李质检', '王主管', '赵总监', '刘经理',
  '陈审核', '周质检', '黄主管', '林总监', '吴经理',
]

const REVIEW_TYPES_ARR: ReviewType[] = ['Internal', 'Client']
const REVIEW_STATUSES_ARR: ReviewStatus[] = ['Pending', 'Approved', 'Rejected']

const MODEL_NAMES = ['Midjourney', 'DALL-E', 'Stable Diffusion', 'Runway', 'Pika']
const MODEL_VERSIONS = ['v6.0', 'v5.2', 'v3', 'Gen-2', '1.0', 'XL 1.0', 'SDXL']

const PROMPT_TEXTS = [
  '高端护肤品广告场景，优雅女性使用产品，自然光线，高级质感',
  '口红色号展示，模特微笑，高清细节，柔和光线',
  '香水产品摄影，极简背景，光影效果，奢华感',
  '面膜使用场景，女性放松享受，SPA氛围，温馨光线',
  '精华液质地展示，水滴慢镜头，透明质感，科技感',
  '防晒霜使用场景，海边度假，清爽不油腻',
  '粉底液色号对比，自然妆容，高清特写',
  '眼影盘试色，模特眼部特写，色彩丰富',
  '护肤品成分展示，实验室环境，科技感',
  '彩妆合集展示，产品排列，时尚感',
]

const IMAGE_MODES: ImageGenerationMode[] = ['text-to-image', 'image-to-image', 'stylization-edit', 'super-resolution', 'inpainting']
const VIDEO_MODES: GenerationMode[] = ['text-to-video', 'image-to-video-first', 'image-to-video-first-tail']
const TASK_STATUSES_ARR: TaskQueueStatus[] = ['done', 'generating', 'in_queue', 'failed', 'cancelled', 'expired', 'submitting', 'not_found']
const STATUS_WEIGHTS = [0.4, 0.15, 0.1, 0.1, 0.05, 0.05, 0.1, 0.05]

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function uid(): string { return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` }
function randomDate(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack))
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
  return d.toISOString()
}
function weightedPick<T>(items: T[], weights: number[]): T {
  const r = Math.random()
  let sum = 0
  for (let i = 0; i < items.length; i++) { sum += weights[i] || 1 / items.length; if (r <= sum) return items[i] }
  return items[items.length - 1]
}

function baseEntity() {
  const now = randomDate(90)
  return { id: uid(), createdAt: now, updatedAt: now }
}

export function generateCustomers(count: number = 35): Customer[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
    contactPerson: CONTACT_PERSONS[i % CONTACT_PERSONS.length],
    roles: ROLE_COMBOS[i % ROLE_COMBOS.length],
    notes: `${CUSTOMER_NAMES[i % CUSTOMER_NAMES.length]}是${['重点客户', '长期合作伙伴', '新开发客户', '高价值客户', '潜力客户'][i % 5]}，${['广告预算充足', '需求频繁', '合作愉快', '对品质要求高', '注重创新'][i % 5]}`,
  }))
}

export function generateBrands(count: number = 35, customers: Customer[] = []): Brand[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    brandName: BRAND_NAMES[i % BRAND_NAMES.length],
    customerId: customers[i % customers.length]?.id || '',
    owner: BRAND_OWNERS[i % BRAND_OWNERS.length],
    notes: `主营${pick(BRAND_INDUSTRIES)}，${['市场表现良好', '品牌知名度高', '增长潜力大', '用户口碑好', '渠道布局完善'][i % 5]}`,
  }))
}

export function generateProjects(count: number = 35, brands: Brand[] = []): Project[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    projectName: PROJECT_NAMES[i % PROJECT_NAMES.length],
    brandId: brands[i % brands.length]?.id || '',
    projectOwner: BRAND_OWNERS[(i + 5) % BRAND_OWNERS.length],
    progress: Math.min(100, Math.max(0, Math.round((i / count) * 100 + Math.random() * 20))),
    stage: PROJECT_STAGES[i % PROJECT_STAGES.length],
    riskLevel: RISK_LEVELS[i % RISK_LEVELS.length],
    pendingReviews: Math.floor(Math.random() * 5),
  }))
}

export function generateShots(count: number = 35, projects: Project[] = []): Shot[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    shotName: SHOT_NAMES[i % SHOT_NAMES.length],
    projectId: projects[i % projects.length]?.id || '',
    firstFrameId: Math.random() > 0.3 ? `kf-${i * 2}` : null,
    lastFrameId: Math.random() > 0.3 ? `kf-${i * 2 + 1}` : null,
    promptId: `prompt-${i}`,
    modelName: pick(MODEL_NAMES),
    modelVersion: pick(MODEL_VERSIONS),
    status: pick<GenerationStatus>(['Pending', 'Completed', 'Failed']),
  }))
}

export function generateKeyFrames(count: number = 35, shots: Shot[] = []): KeyFrame[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    name: KEYFRAME_NAMES[i % KEYFRAME_NAMES.length],
    type: i % 2 === 0 ? 'Opening' : 'Ending',
    promptText: PROMPT_TEXTS[i % PROMPT_TEXTS.length],
    modelName: pick(MODEL_NAMES),
    modelVersion: pick(MODEL_VERSIONS),
    status: pick<GenerationStatus>(['Pending', 'Completed', 'Failed']),
    parentShotId: shots[i % shots.length]?.id || '',
  }))
}

export function generateAssets(count: number = 35, shots: Shot[] = []): Asset[] {
  return Array.from({ length: count }, (_, i) => {
    const type = ASSET_TYPES[i % ASSET_TYPES.length]
    const formats = ASSET_FORMATS_MAP[type] || ['PNG']
    return {
      ...baseEntity(),
      assetName: ASSET_NAMES[i % ASSET_NAMES.length],
      type,
      shotId: shots[i % shots.length]?.id || '',
      promptId: `prompt-${i}`,
      modelName: pick(MODEL_NAMES),
      modelVersion: pick(MODEL_VERSIONS),
      parentAssetIds: [],
      status: pick<AssetStatus>(['Draft', 'Final', 'Approved']),
      fileUrl: type === 'Image' ? COSMETIC_IMAGES[i % COSMETIC_IMAGES.length] : '',
    }
  })
}

export function generateBriefs(count: number = 35, projects: Project[] = []): Brief[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    briefTitle: BRIEF_TITLES[i % BRIEF_TITLES.length],
    projectId: projects[i % projects.length]?.id || '',
    description: BRIEF_DESCRIPTIONS[i % BRIEF_DESCRIPTIONS.length],
    targetAudience: TARGET_AUDIENCES[i % TARGET_AUDIENCES.length],
    platform: PLATFORMS[i % PLATFORMS.length],
    deadline: randomDate(30),
    fileUrl: '',
    currentVersionId: null,
  }))
}

export function generateTasks(count: number = 35, projects: Project[] = []): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    taskName: TASK_NAMES[i % TASK_NAMES.length],
    projectId: projects[i % projects.length]?.id || '',
    assignedTo: ASSIGNEES[i % ASSIGNEES.length],
    status: TASK_STATUSES[i % TASK_STATUSES.length],
    type: TASK_TYPES[i % TASK_TYPES.length],
    deadline: randomDate(30),
    notes: `任务${i + 1}的备注信息`,
  }))
}

export function generateReviews(count: number = 35): Review[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    targetId: `target-${i}`,
    targetType: pick(['Asset', 'Shot', 'Brief'] as const),
    reviewer: REVIEWERS[i % REVIEWERS.length],
    reviewType: REVIEW_TYPES_ARR[i % REVIEW_TYPES_ARR.length],
    status: REVIEW_STATUSES_ARR[i % REVIEW_STATUSES_ARR.length],
    notes: `审核意见${i + 1}：${pick(['符合要求', '需要修改细节', '色彩需调整', '内容需要补充', '通过审核', '需要重新提交'])[i % 6]}`,
  }))
}

export function generateGenerationVersions(count: number = 35, keyFrameIds: string[] = []): GenerationVersion[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    keyFrameId: keyFrameIds[i % keyFrameIds.length] || `kf-${i}`,
    modelName: pick(MODEL_NAMES),
    modelVersion: pick(MODEL_VERSIONS),
    versionNumber: (i % 5) + 1,
    status: pick<GenerationStatus>(['Pending', 'Completed', 'Failed']),
    isSelected: i % 5 === 0,
    generatedAt: randomDate(90),
  }))
}

export function generateImageTasks(count: number = 35): ImageGenerationTask[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    taskId: `img-task-${i}`,
    requestId: `req-img-${i}`,
    mode: IMAGE_MODES[i % IMAGE_MODES.length],
    reqKey: `img-key-${i}`,
    prompt: PROMPT_TEXTS[i % PROMPT_TEXTS.length],
    inputImageUrls: [COSMETIC_IMAGES[i % COSMETIC_IMAGES.length]],
    inputImageBase64: [],
    size: [512, 1024, 2048][i % 3],
    width: [1024, 768, 1920][i % 3],
    height: [1024, 1024, 1080][i % 3],
    scale: i % 3 === 0 ? 2 : undefined,
    seed: Math.floor(Math.random() * 100000),
    forceSingle: i % 2 === 0,
    resolution: i % 2 === 0 ? '4k' : '8k',
    outputImageUrls: [COSMETIC_IMAGES[(i + 10) % COSMETIC_IMAGES.length]],
    outputImageBase64: [],
    keyFrameIds: [`kf-${i}`],
    shotId: `shot-${i % 10}`,
    frameType: i % 2 === 0 ? 'Opening' : 'Ending',
    status: weightedPick(TASK_STATUSES_ARR, STATUS_WEIGHTS),
    progress: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : undefined,
    timeElapsed: `${Math.floor(Math.random() * 30)}s`,
    completedAt: Math.random() > 0.4 ? randomDate(7) : undefined,
    tokensUsed: weightedPick(TASK_STATUSES_ARR, STATUS_WEIGHTS) === 'done' ? Math.floor(12000 + Math.random() * 13000) : undefined,
  }))
}

export function generateVideoTasks(count: number = 35): VideoGenerationTask[] {
  const TEST_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4'
  return Array.from({ length: count }, (_, i) => ({
    ...baseEntity(),
    taskId: `video-task-${i}`,
    requestId: `req-video-${i}`,
    mode: VIDEO_MODES[i % VIDEO_MODES.length],
    reqKey: `video-key-${i}`,
    prompt: PROMPT_TEXTS[i % PROMPT_TEXTS.length],
    firstFrameUrl: COSMETIC_IMAGES[i % COSMETIC_IMAGES.length],
    firstFrameBase64: '',
    lastFrameUrl: Math.random() > 0.5 ? COSMETIC_IMAGES[(i + 15) % COSMETIC_IMAGES.length] : undefined,
    lastFrameBase64: '',
    seed: Math.floor(Math.random() * 100000),
    frames: [24, 48, 96][i % 3],
    aspectRatio: ['16:9', '9:16', '1:1'][i % 3],
    shotId: `shot-${i % 10}`,
    projectId: `project-${i % 10}`,
    status: weightedPick(TASK_STATUSES_ARR, STATUS_WEIGHTS),
    progress: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : undefined,
    videoUrl: Math.random() > 0.4 ? TEST_VIDEO_URL : undefined,
    videoExpiresAt: Math.random() > 0.4 ? randomDate(7) : undefined,
    aigcMetaTagged: i % 2 === 0,
    timeElapsed: `${Math.floor(Math.random() * 120)}s`,
    completedAt: Math.random() > 0.4 ? randomDate(7) : undefined,
    tokensUsed: weightedPick(TASK_STATUSES_ARR, STATUS_WEIGHTS) === 'done' ? Math.floor(1000 + Math.random() * 4000) : undefined,
  }))
}
