import type {
  Customer, Brand, Project, Brief, Task, Review,
  KeyFrame, Shot, Asset, GenerationVersion, Role, Member, MemberStatus,
  ProjectStage, RiskLevel, GenerationStatus,
  TaskStatus, TaskType, ReviewStatus, ReviewType, Visibility,
} from '@/types'
import type { ImageGenerationTask, VideoGenerationTask, TaskQueueStatus, GenerationMode, ImageGenerationMode } from '@/types/generation'
import { AVATAR_COLOR_PALETTE } from '@/constants/brandColors'

function makeColorImage(seed: number): string {
  const hue = (seed * 37) % 360
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${hue},70%,60%)"/><stop offset="100%" stop-color="hsl(${(hue+60)%360},70%,40%)"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g${seed})"/><text x="200" y="155" text-anchor="middle" fill="white" font-size="16" font-family="sans-serif">Asset Image ${seed}</text></svg>`)}`
}

function makeImageVariants(baseSeed: number, count: number): string[] {
  return Array.from({ length: count }, (_, index) => makeColorImage(baseSeed + index))
}

const COSMETIC_IMAGES = Array.from({ length: 32 }, (_, i) => makeColorImage(i))

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

const MEMBER_NAMES = [
  '张明', '李华', '王芳', '赵强', '刘洋',
  '陈晨', '周杰', '吴敏', '郑浩', '孙丽',
  '马磊', '朱婷', '胡军', '郭静', '何勇',
  '高翔', '罗琳', '梁博', '宋雨', '谢鹏',
  '唐欣', '许峰', '韩雪', '冯涛', '曹颖',
  '邓辉', '萧然', '程璐', '蔡明', '贾静',
  '潘磊', '董洁', '袁浩', '杨柳', '马超',
]

const MEMBER_EMAILS = MEMBER_NAMES.map(n => `${n.toLowerCase().replace(/\s/g, '.')}@aigc-demo.com`)
const MEMBER_PHONES = Array.from({ length: 35 }, (_, i) => `1${3 + (i % 7)}${String(10000000 + (i * 7919) % 90000000).slice(0, 9)}`)
const DEPARTMENTS = ['内容创作部', '项目管理部', '审核部', '技术支持部', '市场部', '运营部']
const MEMBER_STATUSES: MemberStatus[] = ['active', 'active', 'active', 'active', 'active', 'active', 'active', 'disabled', 'pending']
const AVATAR_COLORS = AVATAR_COLOR_PALETTE

export function generateMembers(count: number = 35, roleIds: string[] = []): Member[] {
  const defaultRoles = roleIds.length > 0 ? roleIds : ['role-1']
  return Array.from({ length: count }, (_, i) => ({
    id: `member-${i + 1}`,
    name: MEMBER_NAMES[i % MEMBER_NAMES.length],
    email: MEMBER_EMAILS[i % MEMBER_EMAILS.length],
    phone: MEMBER_PHONES[i % MEMBER_PHONES.length],
    avatarUrl: '',
    roleIds: i === 0 ? ['role-1'] : i < 4 ? defaultRoles.slice(0, 2) : defaultRoles.slice(i % defaultRoles.length, (i % defaultRoles.length) + 2),
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    status: MEMBER_STATUSES[i % MEMBER_STATUSES.length],
    lastLoginAt: randomDate(30),
    joinedAt: randomDate(365),
    invitedBy: i === 0 ? '' : `member-${(i % 5) + 1}`,
  }))
}

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

const IMAGE_MODES: ImageGenerationMode[] = ['text-to-image', 'image-to-image', 'text-to-image-31', 'text-to-image-30', 'text-to-image-21']
const VIDEO_MODES: GenerationMode[] = ['text-to-video', 'image-to-video-first', 'image-to-video-first-tail']
const TASK_STATUSES_ARR: TaskQueueStatus[] = ['done', 'generating', 'in_queue', 'failed', 'cancelled', 'submitting', 'not_found']
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

const DEMO_PROJECT_COUNT = 12
const SHOT_COUNT_PATTERN = [5, 6, 7]
const TEST_VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

interface DemoDataset {
  customers: Customer[]
  brands: Brand[]
  projects: Project[]
  shots: Shot[]
  keyFrames: KeyFrame[]
  assets: Asset[]
  generationVersions: GenerationVersion[]
  briefs: Brief[]
  tasks: Task[]
  reviews: Review[]
  imageTasks: ImageGenerationTask[]
  videoTasks: VideoGenerationTask[]
}

function isoOffset(dayOffset: number, minuteOffset: number = 0): string {
  const base = new Date('2026-04-01T09:00:00.000Z').getTime()
  return new Date(base + dayOffset * 86400000 + minuteOffset * 60000).toISOString()
}

function demoEntity(id: string, createdAt: string, updatedAt: string = createdAt) {
  return { id, createdAt, updatedAt }
}

function buildDemoDataset(): DemoDataset {
  const customers = generateCustomers(DEMO_PROJECT_COUNT)
  const brands = generateBrands(DEMO_PROJECT_COUNT, customers)
  const projects: Project[] = []
  const shots: Shot[] = []
  const keyFrames: KeyFrame[] = []
  const imageTasks: ImageGenerationTask[] = []
  const videoTasks: VideoGenerationTask[] = []
  const generationVersions: GenerationVersion[] = []
  const briefs: Brief[] = []
  const tasks: Task[] = []
  const reviews: Review[] = []
  const assets: Asset[] = []

  let globalShotIndex = 0
  let globalAssetIndex = 0
  let globalTaskIndex = 0
  let globalReviewIndex = 0

  for (let projectIndex = 0; projectIndex < DEMO_PROJECT_COUNT; projectIndex++) {
    const projectId = `project-${projectIndex + 1}`
    const projectCreatedAt = isoOffset(projectIndex * 2, 30)
    const shotCount = SHOT_COUNT_PATTERN[projectIndex % SHOT_COUNT_PATTERN.length]
    const pendingReviews = 1 + (projectIndex % 4)
    const project: Project = {
      ...demoEntity(projectId, projectCreatedAt, isoOffset(projectIndex * 2 + 7, 40)),
      projectName: PROJECT_NAMES[projectIndex % PROJECT_NAMES.length],
      brandId: brands[projectIndex % brands.length]?.id || '',
      projectOwner: BRAND_OWNERS[(projectIndex + 5) % BRAND_OWNERS.length],
      progress: 18 + projectIndex * 6,
      stage: PROJECT_STAGES[projectIndex % PROJECT_STAGES.length],
      riskLevel: RISK_LEVELS[projectIndex % RISK_LEVELS.length],
      pendingReviews,
    }
    projects.push(project)

    const firstProjectVersionId = `version-${projectIndex + 1}-1-1`
    briefs.push({
      ...demoEntity(`brief-${projectIndex + 1}`, isoOffset(projectIndex * 2, 80), isoOffset(projectIndex * 2 + 6, 90)),
      briefTitle: BRIEF_TITLES[projectIndex % BRIEF_TITLES.length],
      projectId,
      description: BRIEF_DESCRIPTIONS[projectIndex % BRIEF_DESCRIPTIONS.length],
      targetAudience: TARGET_AUDIENCES[projectIndex % TARGET_AUDIENCES.length],
      platform: PLATFORMS[projectIndex % PLATFORMS.length],
      deadline: isoOffset(projectIndex * 2 + 12, 0),
      fileUrl: `https://example.com/brief/${projectId}`,
      currentVersionId: projectIndex % 2 === 0 ? firstProjectVersionId : null,
    })

    tasks.push(
      {
        ...demoEntity(`task-${projectIndex + 1}-1`, isoOffset(projectIndex * 2 + 1, 120), isoOffset(projectIndex * 2 + 3, 130)),
        taskName: TASK_NAMES[(projectIndex * 2) % TASK_NAMES.length],
        projectId,
        assignedTo: ASSIGNEES[projectIndex % ASSIGNEES.length],
        status: TASK_STATUSES[projectIndex % TASK_STATUSES.length],
        type: TASK_TYPES[projectIndex % TASK_TYPES.length],
        deadline: isoOffset(projectIndex * 2 + 10, 0),
        notes: `${project.projectName} 的关键制作任务`,
      },
      {
        ...demoEntity(`task-${projectIndex + 1}-2`, isoOffset(projectIndex * 2 + 2, 160), isoOffset(projectIndex * 2 + 5, 180)),
        taskName: TASK_NAMES[(projectIndex * 2 + 1) % TASK_NAMES.length],
        projectId,
        assignedTo: ASSIGNEES[(projectIndex + 3) % ASSIGNEES.length],
        status: TASK_STATUSES[(projectIndex + 1) % TASK_STATUSES.length],
        type: TASK_TYPES[(projectIndex + 1) % TASK_TYPES.length],
        deadline: isoOffset(projectIndex * 2 + 12, 0),
        notes: `${project.projectName} 的交付前复核任务`,
      },
    )

    for (let reviewIndex = 0; reviewIndex < pendingReviews; reviewIndex++) {
      reviews.push({
        ...demoEntity(`review-${projectIndex + 1}-${reviewIndex + 1}`, isoOffset(projectIndex * 2 + 5, 45 + reviewIndex * 20)),
        targetId: projectId,
        targetType: reviewIndex % 2 === 0 ? 'Brief' : 'Shot',
        reviewer: REVIEWERS[(projectIndex + reviewIndex) % REVIEWERS.length],
        reviewType: REVIEW_TYPES_ARR[(projectIndex + reviewIndex) % REVIEW_TYPES_ARR.length],
        status: REVIEW_STATUSES_ARR[(projectIndex + reviewIndex) % REVIEW_STATUSES_ARR.length],
        notes: `项目审核记录 ${globalReviewIndex + 1}：${['需要补充镜头细节', '内容通过，可继续制作', '客户建议优化结尾收束'][reviewIndex % 3]}`,
      })
      globalReviewIndex += 1
    }

    for (let shotIndex = 0; shotIndex < shotCount; shotIndex++) {
      globalShotIndex += 1
      const shotId = `shot-${projectIndex + 1}-${shotIndex + 1}`
      const promptId = `prompt-${projectIndex + 1}-${shotIndex + 1}`
      const modelName = MODEL_NAMES[(projectIndex + shotIndex) % MODEL_NAMES.length]
      const modelVersion = MODEL_VERSIONS[(projectIndex * 2 + shotIndex) % MODEL_VERSIONS.length]
      const basePrompt = PROMPT_TEXTS[(projectIndex * 3 + shotIndex) % PROMPT_TEXTS.length]
      const shotCreatedAt = isoOffset(projectIndex * 3 + shotIndex, 120 + shotIndex * 12)
      const shotLabel = SHOT_NAMES[(projectIndex * 5 + shotIndex) % SHOT_NAMES.length]
      const shotName = `${project.projectName} · ${shotLabel}`
      const openingFrameId = `keyframe-${projectIndex + 1}-${shotIndex + 1}-opening`
      const endingFrameId = `keyframe-${projectIndex + 1}-${shotIndex + 1}-ending`
      const openingPrompt = `${basePrompt}，开场镜头，建立产品与人物关系，画面干净，主体明确。`
      const endingPrompt = `${basePrompt}，收尾镜头，品牌资产回收，光线更集中，氛围更完整。`
      const videoPrompt = `${basePrompt}，镜头推进自然，适合 8-10 秒品牌短视频，节奏克制。`
      const openingImage = COSMETIC_IMAGES[(projectIndex * 7 + shotIndex * 2) % COSMETIC_IMAGES.length]
      const endingImage = COSMETIC_IMAGES[(projectIndex * 7 + shotIndex * 2 + 1) % COSMETIC_IMAGES.length]

      shots.push({
        ...demoEntity(shotId, shotCreatedAt, isoOffset(projectIndex * 3 + shotIndex + 2, 210)),
        shotName,
        projectId,
        firstFrameId: openingFrameId,
        lastFrameId: endingFrameId,
        finalVideoTaskId: null,
        promptId,
        modelName,
        modelVersion,
      })

      keyFrames.push(
        {
          ...demoEntity(openingFrameId, isoOffset(projectIndex * 3 + shotIndex, 150), isoOffset(projectIndex * 3 + shotIndex, 210)),
          name: `${KEYFRAME_NAMES[(globalShotIndex * 2) % KEYFRAME_NAMES.length]} · 开场`,
          type: 'Opening',
          promptText: openingPrompt,
          modelName,
          modelVersion,
          status: 'Completed',
          parentShotId: shotId,
        },
        {
          ...demoEntity(endingFrameId, isoOffset(projectIndex * 3 + shotIndex, 180), isoOffset(projectIndex * 3 + shotIndex, 240)),
          name: `${KEYFRAME_NAMES[(globalShotIndex * 2 + 1) % KEYFRAME_NAMES.length]} · 收尾`,
          type: 'Ending',
          promptText: endingPrompt,
          modelName,
          modelVersion,
          status: 'Completed',
          parentShotId: shotId,
        },
      )

      const openingImageTaskId = `image-task-${projectIndex + 1}-${shotIndex + 1}-opening`
      const endingImageTaskId = `image-task-${projectIndex + 1}-${shotIndex + 1}-ending`
      const videoTaskId = `video-task-${projectIndex + 1}-${shotIndex + 1}`
      const openingCount = (globalShotIndex % 4) + 1
      const endingCount = ((globalShotIndex + 2) % 4) + 1
      const openingOutputs = makeImageVariants(globalShotIndex * 10 + 1, openingCount)
      const endingOutputs = makeImageVariants(globalShotIndex * 10 + 101, endingCount)
      const openingKeyFrameIds = Array.from({ length: openingCount }, (_, index) =>
        index === 0 ? openingFrameId : `${openingFrameId}-variant-${index + 1}`,
      )
      const endingKeyFrameIds = Array.from({ length: endingCount }, (_, index) =>
        index === 0 ? endingFrameId : `${endingFrameId}-variant-${index + 1}`,
      )

      imageTasks.push(
        {
          ...demoEntity(openingImageTaskId, isoOffset(projectIndex * 3 + shotIndex, 145), isoOffset(projectIndex * 3 + shotIndex, 215)),
          taskId: `img-task-${projectIndex + 1}-${shotIndex + 1}-opening`,
          requestId: `req-img-${projectIndex + 1}-${shotIndex + 1}-opening`,
          mode: IMAGE_MODES[(projectIndex + shotIndex) % IMAGE_MODES.length],
          reqKey: `text-to-image-${modelVersion.toLowerCase().replace(/\s+/g, '-')}`,
          prompt: openingPrompt,
          inputImageUrls: [],
          inputImageBase64: [],
          size: 1024,
          width: 1024,
          height: 1024,
          scale: 2,
          seed: 1000 + globalShotIndex,
          numImages: openingCount,
          forceSingle: openingCount === 1,
          resolution: shotIndex % 2 === 0 ? '4k' : '8k',
          outputImageUrls: openingOutputs,
          outputImageBase64: [],
          keyFrameIds: openingKeyFrameIds,
          projectId,
          shotId,
          frameType: 'Opening',
          status: 'done',
          progress: 100,
          timeElapsed: `${12 + shotIndex}s`,
          completedAt: isoOffset(projectIndex * 3 + shotIndex, 215),
          tokensUsed: 12000 + projectIndex * 400 + shotIndex * 130,
        },
        {
          ...demoEntity(endingImageTaskId, isoOffset(projectIndex * 3 + shotIndex, 175), isoOffset(projectIndex * 3 + shotIndex, 255)),
          taskId: `img-task-${projectIndex + 1}-${shotIndex + 1}-ending`,
          requestId: `req-img-${projectIndex + 1}-${shotIndex + 1}-ending`,
          mode: IMAGE_MODES[(projectIndex + shotIndex + 1) % IMAGE_MODES.length],
          reqKey: `text-to-image-${modelVersion.toLowerCase().replace(/\s+/g, '-')}-ending`,
          prompt: endingPrompt,
          inputImageUrls: [],
          inputImageBase64: [],
          size: 1024,
          width: 1024,
          height: 1024,
          scale: 2,
          seed: 2000 + globalShotIndex,
          numImages: endingCount,
          forceSingle: endingCount === 1,
          resolution: shotIndex % 2 === 0 ? '8k' : '4k',
          outputImageUrls: endingOutputs,
          outputImageBase64: [],
          keyFrameIds: endingKeyFrameIds,
          projectId,
          shotId,
          frameType: 'Ending',
          status: 'done',
          progress: 100,
          timeElapsed: `${15 + shotIndex}s`,
          completedAt: isoOffset(projectIndex * 3 + shotIndex, 255),
          tokensUsed: 12600 + projectIndex * 420 + shotIndex * 140,
        },
      )

      videoTasks.push({
        ...demoEntity(videoTaskId, isoOffset(projectIndex * 3 + shotIndex, 205), isoOffset(projectIndex * 3 + shotIndex, 320)),
        taskId: `video-task-remote-${projectIndex + 1}-${shotIndex + 1}`,
        requestId: `req-video-${projectIndex + 1}-${shotIndex + 1}`,
        mode: VIDEO_MODES[(projectIndex + shotIndex) % VIDEO_MODES.length],
        reqKey: `seedance-1.5-pro-${['16x9', '9x16', '1x1'][(projectIndex + shotIndex) % 3]}`,
        prompt: videoPrompt,
        firstFrameUrl: openingImage,
        firstFrameBase64: '',
        lastFrameUrl: endingImage,
        lastFrameBase64: '',
        seed: 3000 + globalShotIndex,
        frames: [48, 72, 96][(projectIndex + shotIndex) % 3],
        aspectRatio: ['16:9', '9:16', '1:1'][(projectIndex + shotIndex) % 3],
        shotId,
        projectId,
        status: 'done',
        progress: 100,
        videoUrl: TEST_VIDEO_URL,
        aigcMetaTagged: true,
        timeElapsed: `${38 + shotIndex * 3}s`,
        completedAt: isoOffset(projectIndex * 3 + shotIndex, 320),
        tokensUsed: 1800 + projectIndex * 120 + shotIndex * 90,
      })

      shots[shots.length - 1].finalVideoTaskId = videoTaskId

      const versionSpecs = [
        { frameId: openingFrameId, total: 2 },
        { frameId: endingFrameId, total: shotIndex % 2 === 0 ? 2 : 1 },
      ]

      versionSpecs.forEach(({ frameId, total }) => {
        for (let versionIndex = 0; versionIndex < total; versionIndex++) {
          generationVersions.push({
            ...demoEntity(
              `version-${projectIndex + 1}-${shotIndex + 1}-${generationVersions.length + 1}`,
              isoOffset(projectIndex * 3 + shotIndex, 160 + versionIndex * 18),
            ),
            keyFrameId: frameId,
            modelName: MODEL_NAMES[(projectIndex + shotIndex + versionIndex) % MODEL_NAMES.length],
            modelVersion: MODEL_VERSIONS[(projectIndex + shotIndex + versionIndex) % MODEL_VERSIONS.length],
            versionNumber: versionIndex + 1,
            status: 'Completed',
            isSelected: versionIndex === total - 1,
            generatedAt: isoOffset(projectIndex * 3 + shotIndex, 160 + versionIndex * 18),
          })
        }
      })

      assets.push(
        {
          ...demoEntity(`asset-${++globalAssetIndex}`, isoOffset(projectIndex * 3 + shotIndex, 216)),
          assetName: `${ASSET_NAMES[(globalShotIndex * 2) % ASSET_NAMES.length]} · 首图`,
          type: 'Image',
          projectId,
          shotId,
          sourceType: 'image-task',
          sourceTaskId: openingImageTaskId,
          sourceResultIndex: 0,
          promptId,
          modelName,
          modelVersion,
          parentAssetIds: [],
          fileUrl: openingImage,
        },
        {
          ...demoEntity(`asset-${++globalAssetIndex}`, isoOffset(projectIndex * 3 + shotIndex, 321)),
          assetName: `${ASSET_NAMES[(globalShotIndex * 2 + 1) % ASSET_NAMES.length]} · 视频`,
          type: 'Video',
          projectId,
          shotId,
          sourceType: 'video-task',
          sourceTaskId: videoTaskId,
          promptId,
          modelName: 'Seedance',
          modelVersion: '1.5 Pro',
          parentAssetIds: [],
          fileUrl: TEST_VIDEO_URL,
        },
      )
    }

    assets.push({
      ...demoEntity(`asset-${++globalAssetIndex}`, isoOffset(projectIndex * 3 + 1, 90)),
      assetName: `${ASSET_NAMES[(projectIndex + 5) % ASSET_NAMES.length]} · 提案脚本`,
      type: 'Script',
      projectId,
      sourceType: 'script',
      promptId: `brief-prompt-${projectIndex + 1}`,
      modelName: MODEL_NAMES[projectIndex % MODEL_NAMES.length],
      modelVersion: MODEL_VERSIONS[(projectIndex + 2) % MODEL_VERSIONS.length],
      parentAssetIds: [],
      fileUrl: `https://example.com/script/${projectId}.pdf`,
    })
  }

  return {
    customers,
    brands,
    projects,
    shots,
    keyFrames,
    assets,
    generationVersions,
    briefs,
    tasks,
    reviews,
    imageTasks,
    videoTasks,
  }
}

export const DEMO_DATASET = buildDemoDataset()

export function generateProjects(count: number = DEMO_PROJECT_COUNT, _brands: Brand[] = []): Project[] {
  return DEMO_DATASET.projects.slice(0, count)
}

export function generateShots(count: number = DEMO_DATASET.shots.length, _projects: Project[] = []): Shot[] {
  return DEMO_DATASET.shots.slice(0, count)
}

export function generateKeyFrames(count: number = DEMO_DATASET.keyFrames.length, _shots: Shot[] = []): KeyFrame[] {
  return DEMO_DATASET.keyFrames.slice(0, count)
}

export function generateAssets(
  count: number = DEMO_DATASET.assets.length,
  _shots: Shot[] = [],
  _imageTasks: ImageGenerationTask[] = [],
  _videoTasks: VideoGenerationTask[] = [],
): Asset[] {
  return DEMO_DATASET.assets.slice(0, count)
}

export function generateBriefs(count: number = DEMO_DATASET.briefs.length, _projects: Project[] = []): Brief[] {
  return DEMO_DATASET.briefs.slice(0, count)
}

export function generateTasks(count: number = DEMO_DATASET.tasks.length, _projects: Project[] = []): Task[] {
  return DEMO_DATASET.tasks.slice(0, count)
}

export function generateReviews(count: number = DEMO_DATASET.reviews.length): Review[] {
  return DEMO_DATASET.reviews.slice(0, count)
}

export function generateGenerationVersions(count: number = DEMO_DATASET.generationVersions.length, _keyFrameIds: string[] = []): GenerationVersion[] {
  return DEMO_DATASET.generationVersions.slice(0, count)
}

export function generateImageTasks(count: number = DEMO_DATASET.imageTasks.length): ImageGenerationTask[] {
  return DEMO_DATASET.imageTasks.slice(0, count)
}

export function generateVideoTasks(count: number = DEMO_DATASET.videoTasks.length): VideoGenerationTask[] {
  return DEMO_DATASET.videoTasks.slice(0, count)
}

export const MOCK_IMAGE_TASKS = DEMO_DATASET.imageTasks
export const MOCK_VIDEO_TASKS = DEMO_DATASET.videoTasks
