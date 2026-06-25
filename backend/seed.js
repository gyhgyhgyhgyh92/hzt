const { getDb, runSql } = require('./db/database');

const cases = [
  {
    title: 'ChatGPT',
    category: '消费级',
    field: '通用对话',
    ai_tech: 'GPT-4大语言模型',
    background: 'OpenAI推出的对话式AI助手，重新定义了人机交互方式，成为全球用户增长最快的消费级应用。',
    feature_analysis: '多轮对话理解、上下文记忆、代码生成、多语言支持、插件生态扩展。',
    ai_tech_analysis: '基于Transformer架构的超大规模语言模型，通过RLHF对齐人类偏好，支持长上下文窗口。',
    business_model: '免费+订阅制（ChatGPT Plus $20/月），API按token计费，企业版Team/Enterprise方案。',
    pros_cons: '优势：通用能力强、生态完善、用户基数大；劣势：幻觉问题、实时性不足、隐私争议。',
    improvement: '增强事实核查能力，减少幻觉；提升多模态交互体验；加强企业级数据安全合规。'
  },
  {
    title: 'Midjourney',
    category: '消费级',
    field: 'AI绘画',
    ai_tech: '扩散模型（Diffusion Model）',
    background: '由同名研究实验室开发的AI图像生成工具，以极高的艺术质量和美学风格著称，在设计师和创作者中广受欢迎。',
    feature_analysis: '文本生成图像、风格迁移、图像变体、局部重绘、高分辨率输出、社区灵感库。',
    ai_tech_analysis: '基于扩散模型的图像生成技术，通过去噪过程逐步构建图像，结合CLIP模型实现文本-图像对齐。',
    business_model: '纯订阅制，基础版$10/月（200张），标准版$30/月（无限慢速），专业版$60/月（隐身模式+更快生成）。',
    pros_cons: '优势：艺术质量业界领先、社区活跃、风格多样；劣势：学习曲线陡峭、商用版权模糊、依赖Discord。',
    improvement: '推出独立Web端降低门槛；完善商用授权体系；增加视频生成能力。'
  },
  {
    title: 'Suno',
    category: '消费级',
    field: 'AI音乐',
    ai_tech: '音乐生成大模型',
    background: 'AI音乐创作平台，让普通用户无需音乐基础即可生成高质量歌曲，迅速成为音乐创作领域的现象级产品。',
    feature_analysis: '文本生成歌曲、人声合成、多风格音乐、歌词创作辅助、歌曲延展、instrumental纯音乐生成。',
    ai_tech_analysis: '结合语言模型和音频生成模型，理解歌词结构和旋律规律，生成包含人声和伴奏的完整歌曲。',
    business_model: '免费额度（每日5首）+ 订阅制Pro版$10/月（500首/月）、Premier版$30/月（2000首/月），商用授权。',
    pros_cons: '优势：生成质量高、操作简单、风格丰富；劣势：版权争议、人声相似度、长歌曲连贯性不足。',
    improvement: '提升人声自然度和情感表达；解决AI生成音乐的版权归属问题；支持更多语种和风格。'
  },
  {
    title: 'Notion AI',
    category: '消费级',
    field: '效率工具',
    ai_tech: '大语言模型 + RAG',
    background: 'Notion在其协作平台中嵌入AI能力，将AI融入日常工作流，成为知识管理和生产力领域的标杆产品。',
    feature_analysis: 'AI写作助手、文档摘要、翻译、头脑风暴、Q&A基于工作空间内容、自动填充数据库。',
    ai_tech_analysis: '基于大语言模型，结合RAG技术检索用户工作空间内容，实现上下文感知的AI辅助。',
    business_model: 'AI功能作为附加订阅$10/月/人，基础版免费但AI额度有限，企业版包含高级AI功能。',
    pros_cons: '优势：与现有工作流无缝集成、上下文理解强、多场景覆盖；劣势：需额外付费、中文支持待优化、依赖网络。',
    improvement: '增强中文语境理解；降低AI附加费用门槛；提升离线场景下的AI能力。'
  },
  {
    title: 'GitHub Copilot',
    category: '消费级',
    field: '开发工具',
    ai_tech: '代码大模型（Codex）',
    background: 'GitHub与OpenAI合作推出的AI编程助手，深度集成在VS Code等IDE中，显著提升了开发者编码效率。',
    feature_analysis: '代码自动补全、函数生成、代码解释、单元测试生成、多语言支持、聊天式编程助手。',
    ai_tech_analysis: '基于OpenAI Codex模型（GPT-3的代码特化版），在海量开源代码上训练，理解编程语境和模式。',
    business_model: '个人版$10/月，商业版$19/用户/月，企业版$39/用户/月（含策略管理、IP保护），学生/维护者免费。',
    pros_cons: '优势：IDE集成度高、代码建议准确、支持多语言；劣势：偶尔生成低质量代码、版权风险、依赖网络。',
    improvement: '提升代码安全性和合规性检查；增强对私有代码库的理解；支持更多IDE和编程语言。'
  },
  {
    title: 'Salesforce Einstein',
    category: '企业服务',
    field: 'CRM',
    ai_tech: '预测式AI + 生成式AI',
    background: 'Salesforce将AI能力深度整合到CRM平台中，帮助企业实现销售预测、客户服务智能化和营销自动化。',
    feature_analysis: '销售机会预测、客户流失预警、智能线索评分、邮件自动生成、服务工单智能路由、对话式AI助手。',
    ai_tech_analysis: '结合预测式AI（传统机器学习模型）和生成式AI（大语言模型），基于企业数据进行个性化预测和内容生成。',
    business_model: '包含在Salesforce各版本中，Einstein 1起步$25/用户/月，Enterprise版$165/用户/月，按功能模块分级定价。',
    pros_cons: '优势：与企业数据深度集成、功能全面、行业积累深厚；劣势：实施复杂、价格高昂、定制化受限。',
    improvement: '降低实施门槛和成本；增强中小企业适用性；提升AI模型的可解释性。'
  },
  {
    title: 'HubSpot AI',
    category: '企业服务',
    field: '营销自动化',
    ai_tech: '生成式AI + 预测分析',
    background: 'HubSpot在营销、销售、服务平台中嵌入AI能力，帮助中小企业实现营销自动化和客户关系管理智能化。',
    feature_analysis: 'AI内容生成、邮件优化、聊天机器人、线索预测、对话智能、内容策略建议。',
    ai_tech_analysis: '利用生成式AI辅助内容创作，预测分析模型进行线索评分和行为预测，NLP驱动对话式交互。',
    business_model: '免费版包含基础AI功能，Starter $20/月起，Professional $890/月起，Enterprise $3600/月起，AI功能按使用量计费。',
    pros_cons: '优势：入门门槛低、功能模块化、中小企业友好；劣势：高级功能价格陡增、定制化能力有限、数据迁移困难。',
    improvement: '优化高级版的性价比；增强与第三方工具的AI集成；提升数据分析深度。'
  },
  {
    title: '平安好医生AI',
    category: '垂直行业',
    field: '医疗健康',
    ai_tech: '医疗AI + 知识图谱',
    background: '平安集团旗下互联网医疗平台，利用AI技术提供智能问诊、健康管理等服务，缓解医疗资源不均问题。',
    feature_analysis: 'AI智能问诊、症状自查、电子处方、慢病管理、健康档案、AI辅助影像诊断。',
    ai_tech_analysis: '基于医学知识图谱和深度学习，构建症状-疾病推理网络，结合计算机视觉辅助医学影像分析。',
    business_model: '基础问诊免费，会员服务$15/月，家庭医生$100/年，企业健康管理方案按人数定价，药品电商佣金。',
    pros_cons: '优势：医疗资源丰富、7x24小时服务、降低就医门槛；劣势：误诊风险、用户信任度、监管合规压力。',
    improvement: '提升罕见病诊断准确率；加强与线下医疗机构的协作；完善AI诊断的责任界定机制。'
  },
  {
    title: '松鼠Ai',
    category: '垂直行业',
    field: '教育科技',
    ai_tech: '自适应学习AI',
    background: '中国领先的K12自适应学习平台，通过AI技术实现个性化教学，解决教育资源不均衡问题。',
    feature_analysis: '知识图谱诊断、自适应学习路径、智能题目推荐、学习报告、薄弱点精准定位、AI教师辅助。',
    ai_tech_analysis: '基于知识图谱和推荐算法，构建学科知识网络，通过学生行为数据建模，动态调整学习内容和难度。',
    business_model: '线下学习中心加盟（单店投资30-50万），线上会员$30-100/月，1对1 AI辅导$200/小时，学校B端采购。',
    pros_cons: '优势：个性化程度高、学习效果可量化、规模化复制能力强；劣势：依赖线下中心、学科覆盖有限、效果争议。',
    improvement: '拓展更多学科和年龄段；增强AI教师的情感交互能力；建立更科学的效果评估体系。'
  },
  {
    title: '蚂蚁财富AI理财',
    category: '垂直行业',
    field: '金融科技',
    ai_tech: '金融AI + 风控模型',
    background: '蚂蚁集团旗下智能理财平台，利用AI技术为普通用户提供个性化的资产配置和风险管理服务。',
    feature_analysis: '智能投顾、风险测评、资产配置建议、市场预测、AI客服、个性化理财产品推荐。',
    ai_tech_analysis: '结合量化投资模型和风险评估算法，基于用户画像和市场数据进行资产配置优化，NLP驱动智能客服。',
    business_model: '基础服务免费（通过基金销售佣金盈利），高级投顾$50/月，VIP理财规划$200/年，机构API服务按调用量计费。',
    pros_cons: '优势：用户基数大、风控能力强、普惠金融；劣势：投资收益不确定、监管严格、用户教育成本高。',
    improvement: '提升市场极端情况下的风控能力；增强投资者教育功能；优化长期收益稳定性。'
  }
];

const prdTemplates = [
  {
    name: 'AI功能类 - 智能推荐系统',
    type: 'AI功能',
    content: JSON.stringify({
      overview: '智能推荐系统PRD模板，适用于电商、内容、社交等场景的个性化推荐功能设计。',
      modules: [
        { name: '需求背景', desc: '用户面临信息过载，需要个性化内容/商品推荐提升转化率和用户体验。' },
        { name: '用户画像', desc: '定义目标用户群体，包括用户行为特征、偏好标签、使用场景。' },
        { name: '推荐算法', desc: '协同过滤、内容推荐、深度学习模型（如双塔模型、DIN），A/B测试框架。' },
        { name: '功能设计', desc: '推荐位展示、个性化标签、实时推荐、冷启动策略、推荐解释。' },
        { name: '数据指标', desc: '点击率、转化率、用户停留时长、推荐覆盖率、Novelty指标。' },
        { name: '技术方案', desc: '特征工程、模型训练、在线推理、缓存策略、降级方案。' }
      ]
    }),
    example: JSON.stringify({
      scenario: '电商平台首页商品推荐',
      target: '提升用户购买转化率15%，增加用户停留时长20%',
      algorithm: '基于用户行为序列的DIN模型 + 实时特征',
      metrics: 'CTR 8%+, CVR 3%+, 人均浏览商品数 50+'
    }),
    guide: '使用本模板时，需根据具体业务场景调整推荐算法选择，明确冷启动策略，设计完善的A/B测试方案，并关注推荐系统的可解释性。'
  },
  {
    name: '工具类 - 数据可视化工具',
    type: '工具类',
    content: JSON.stringify({
      overview: '数据可视化工具PRD模板，适用于BI平台、数据分析工具、报表系统等场景。',
      modules: [
        { name: '产品定位', desc: '面向数据分析师/业务人员的数据可视化平台，降低数据分析门槛。' },
        { name: '核心功能', desc: '数据源接入、图表编辑器、仪表盘搭建、数据探索、协作分享。' },
        { name: '图表类型', desc: '折线图、柱状图、饼图、散点图、地图、热力图、桑基图等20+图表类型。' },
        { name: '交互设计', desc: '拖拽式操作、实时预览、联动筛选、下钻分析、响应式布局。' },
        { name: '性能要求', desc: '百万级数据秒级渲染、大数据量分页、缓存策略、增量加载。' },
        { name: '权限管理', desc: '数据源权限、报表权限、操作权限、审计日志。' }
      ]
    }),
    example: JSON.stringify({
      scenario: '企业内部销售数据分析平台',
      target: '销售团队自助分析，减少IT部门报表需求80%',
      charts: '销售趋势折线图、区域分布地图、产品占比饼图、TOP10排行榜',
      performance: '100万行数据查询<3秒，仪表盘加载<2秒'
    }),
    guide: '重点关注数据源兼容性、图表渲染性能、用户操作流畅性。建议采用WebGL加速渲染，支持实时数据刷新。'
  },
  {
    name: '服务类 - 在线教育平台',
    type: '服务类',
    content: JSON.stringify({
      overview: '在线教育平台PRD模板，适用于K12、职业教育、企业培训等场景的在线学习系统设计。',
      modules: [
        { name: '市场分析', desc: '目标市场规模、竞品分析、用户痛点、差异化定位。' },
        { name: '用户角色', desc: '学生、教师、家长、管理员，各角色的核心需求和使用场景。' },
        { name: '课程管理', desc: '课程创建、内容上传、章节管理、作业布置、考试系统。' },
        { name: '学习体验', desc: '视频播放、互动问答、学习进度、证书系统、社区讨论。' },
        { name: '运营体系', desc: '用户增长、留存策略、付费转化、教师激励、内容审核。' },
        { name: '技术架构', desc: '视频 CDN、实时互动、高并发支持、数据埋点、推荐系统。' }
      ]
    }),
    example: JSON.stringify({
      scenario: 'K12数学在线辅导平台',
      target: '服务10万+学生，完课率>60%，续费率>40%',
      features: 'AI自适应学习路径、实时互动课堂、智能作业批改、学情分析报告',
      metrics: 'DAU 5万+, 平均学习时长 45分钟/天, NPS > 50'
    }),
    guide: '教育产品需特别关注学习效果可量化、内容质量把控、合规性要求（如未成年人保护）。建议采用自适应学习技术提升个性化体验。'
  }
];

async function seed() {
  await getDb();
  console.log('开始插入种子数据...');

  // 插入案例
  for (const c of cases) {
    runSql('INSERT INTO cases (title, category, field, ai_tech, background, feature_analysis, ai_tech_analysis, business_model, pros_cons, improvement) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [c.title, c.category, c.field, c.ai_tech, c.background, c.feature_analysis, c.ai_tech_analysis, c.business_model, c.pros_cons, c.improvement]);
  }
  console.log(`已插入 ${cases.length} 个AI产品案例`);

  // 插入PRD模板
  for (const t of prdTemplates) {
    runSql('INSERT INTO prd_templates (name, type, content, example, guide) VALUES (?,?,?,?,?)',
      [t.name, t.type, t.content, t.example, t.guide]);
  }
  console.log(`已插入 ${prdTemplates.length} 套PRD模板`);

  console.log('种子数据初始化完成！');
}

seed().catch(err => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
