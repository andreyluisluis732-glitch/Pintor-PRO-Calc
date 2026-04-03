export interface ColorInfo {
  name: string;
  hex: string;
  code: string;
}

export interface PaintProduct {
  id: string;
  name: string;
  category: 'Paredes' | 'Madeiras e Metais' | 'Pisos' | 'Massas e Preparação' | 'Vernizes' | 'Impermeabilizantes';
  description: string;
  finish: 'Fosco' | 'Acetinado' | 'Semibrilho' | 'Brilhante' | 'Natural';
  yieldPerLiter: number; // m2 per liter per coat
  pricePerLiter: number;
  pricePerCan?: number; // 3.6L
  pricePerBucket?: number; // 18L
  colors: ColorInfo[];
  info: string;
}

const COMMON_COLORS: ColorInfo[] = [
  { name: 'Branco Puro', hex: '#FFFFFF', code: '1.001.84' },
  { name: 'Branco Geada', hex: '#E8EAE6', code: '1.002.84' },
  { name: 'Cinza Claro', hex: '#BDC3C7', code: '7.007.84' },
  { name: 'Cinza Médio', hex: '#95A5A6', code: '7.010.84' },
  { name: 'Preto Fosco', hex: '#000000', code: '7.005.84' },
  { name: 'Azul Segurança', hex: '#2471A3', code: '4.005.84' },
  { name: 'Verde Segurança', hex: '#27AE60', code: '5.002.84' },
  { name: 'Vermelho Segurança', hex: '#E74C3C', code: '3.005.84' },
  { name: 'Amarelo Segurança', hex: '#F1C40F', code: '2.006.84' },
  { name: 'Laranja Boreal', hex: '#E67E22', code: '2.005.84' },
  { name: 'Marrom Bronze', hex: '#5D4037', code: '8.009.84' },
  { name: 'Azul Arara', hex: '#154360', code: '4.003.84' },
];

export const PRODUCT_CATALOG: PaintProduct[] = [
  // PAREDES
  {
    id: 'acrylic-economic',
    name: 'Acrílica Econômica',
    category: 'Paredes',
    description: 'Indicada para ambientes internos, baixo odor.',
    finish: 'Fosco',
    yieldPerLiter: 6,
    pricePerLiter: 25,
    pricePerCan: 85,
    pricePerBucket: 290,
    colors: [
      { name: 'Branco Puro', hex: '#FFFFFF', code: '1.001.84' },
      { name: 'Branco Geada', hex: '#E8EAE6', code: '1.002.84' },
      { name: 'Palha', hex: '#F5F5DC', code: '1.003.84' },
      { name: 'Areia', hex: '#C2B280', code: '1.004.84' },
    ],
    info: 'Secagem rápida, acabamento fosco. Não recomendada para áreas externas ou úmidas.'
  },
  {
    id: 'acrylic-standard',
    name: 'Acrílica Standard',
    category: 'Paredes',
    description: 'Ótimo rendimento e resistência, para interno/externo.',
    finish: 'Fosco',
    yieldPerLiter: 8,
    pricePerLiter: 40,
    pricePerCan: 135,
    pricePerBucket: 480,
    colors: COMMON_COLORS.slice(0, 8),
    info: 'Resistente a intempéries, boa cobertura e durabilidade.'
  },
  {
    id: 'acrylic-premium-fosco',
    name: 'Acrílica Premium Fosco',
    category: 'Paredes',
    description: 'Alta cobertura, lavável e máxima durabilidade.',
    finish: 'Fosco',
    yieldPerLiter: 10,
    pricePerLiter: 65,
    pricePerCan: 220,
    pricePerBucket: 790,
    colors: COMMON_COLORS,
    info: 'Disfarça imperfeições da parede. Super lavável e antimofo.'
  },
  {
    id: 'acrylic-premium-acetinado',
    name: 'Acrílica Premium Acetinado',
    category: 'Paredes',
    description: 'Toque de seda, brilho suave e fácil limpeza.',
    finish: 'Acetinado',
    yieldPerLiter: 11,
    pricePerLiter: 75,
    pricePerCan: 260,
    pricePerBucket: 950,
    colors: COMMON_COLORS.slice(0, 6),
    info: 'Acabamento sofisticado com brilho discreto. Altamente resistente à limpeza.'
  },
  {
    id: 'acrylic-premium-semibrilho',
    name: 'Acrílica Premium Semibrilho',
    category: 'Paredes',
    description: 'Máximo brilho e proteção para suas paredes.',
    finish: 'Semibrilho',
    yieldPerLiter: 11,
    pricePerLiter: 72,
    pricePerCan: 250,
    pricePerBucket: 920,
    colors: COMMON_COLORS.slice(0, 6),
    info: 'Ideal para quem busca brilho intenso e facilidade extrema na limpeza.'
  },
  // PISOS
  {
    id: 'floor-paint',
    name: 'Tinta para Piso Premium',
    category: 'Pisos',
    description: 'Alta resistência ao tráfego de pessoas e veículos.',
    finish: 'Fosco',
    yieldPerLiter: 7,
    pricePerLiter: 55,
    pricePerCan: 190,
    pricePerBucket: 680,
    colors: [
      { name: 'Cinza Médio', hex: '#95A5A6', code: '7.010.84' },
      { name: 'Preto Fosco', hex: '#000000', code: '7.005.84' },
      { name: 'Azul Segurança', hex: '#2471A3', code: '4.005.84' },
      { name: 'Verde Segurança', hex: '#27AE60', code: '5.002.84' },
      { name: 'Amarelo Segurança', hex: '#F1C40F', code: '2.006.84' },
      { name: 'Vermelho Segurança', hex: '#E74C3C', code: '3.005.84' },
    ],
    info: 'Ideal para garagens, calçadas, quadras poliesportivas e áreas comerciais.'
  },
  // MADEIRAS E METAIS
  {
    id: 'enamel-synthetic',
    name: 'Esmalte Sintético Standard',
    category: 'Madeiras e Metais',
    description: 'Proteção para portões, grades e janelas.',
    finish: 'Brilhante',
    yieldPerLiter: 12,
    pricePerLiter: 45,
    pricePerCan: 155,
    pricePerBucket: 560,
    colors: COMMON_COLORS,
    info: 'Alta resistência e brilho duradouro. Necessita aguarrás para diluição.'
  },
  {
    id: 'enamel-water-based',
    name: 'Esmalte Base Água Premium',
    category: 'Madeiras e Metais',
    description: 'Sem cheiro, não amarela e secagem ultra rápida.',
    finish: 'Acetinado',
    yieldPerLiter: 11,
    pricePerLiter: 68,
    pricePerCan: 235,
    pricePerBucket: 840,
    colors: COMMON_COLORS.slice(0, 5),
    info: 'Ideal para interiores. Limpeza das ferramentas apenas com água.'
  },
  // MASSAS E PREPARAÇÃO
  {
    id: 'massa-corrida',
    name: 'Massa Corrida PVA',
    category: 'Massas e Preparação',
    description: 'Nivelamento de superfícies internas.',
    finish: 'Fosco',
    yieldPerLiter: 2,
    pricePerLiter: 15,
    pricePerCan: 55,
    pricePerBucket: 180,
    colors: [{ name: 'Branco Puro', hex: '#FFFFFF', code: '1.001.84' }],
    info: 'Fácil de lixar, corrige imperfeições em paredes de alvenaria internas.'
  },
  {
    id: 'massa-acrilica',
    name: 'Massa Acrílica',
    category: 'Massas e Preparação',
    description: 'Nivelamento de superfícies externas e úmidas.',
    finish: 'Fosco',
    yieldPerLiter: 1.5,
    pricePerLiter: 22,
    pricePerCan: 75,
    pricePerBucket: 260,
    colors: [{ name: 'Branco Puro', hex: '#FFFFFF', code: '1.001.84' }],
    info: 'Resistente à umidade, ideal para fachadas, banheiros e cozinhas.'
  },
  {
    id: 'fundo-preparador',
    name: 'Fundo Preparador de Paredes',
    category: 'Massas e Preparação',
    description: 'Fixa partículas soltas e melhora a aderência.',
    finish: 'Natural',
    yieldPerLiter: 12,
    pricePerLiter: 35,
    pricePerCan: 120,
    pricePerBucket: 420,
    colors: [{ name: 'Incolor', hex: 'transparent', code: '0.000.00' }],
    info: 'Essencial para paredes descascadas, calcinadas ou com gesso.'
  },
  // VERNIZES
  {
    id: 'verniz-maritimo',
    name: 'Verniz Marítimo Premium',
    category: 'Vernizes',
    description: 'Proteção para madeiras em geral.',
    finish: 'Brilhante',
    yieldPerLiter: 12,
    pricePerLiter: 80,
    pricePerCan: 275,
    pricePerBucket: 980,
    colors: [
      { name: 'Incolor', hex: 'rgba(255,255,255,0.1)', code: '0.001' },
      { name: 'Imbuia', hex: '#4B3621', code: '0.002' },
      { name: 'Mogno', hex: '#4E1609', code: '0.003' },
      { name: 'Cedro', hex: '#A5633C', code: '0.004' },
    ],
    info: 'Filtro solar, realça a beleza natural da madeira e protege contra sol e chuva.'
  },
  {
    id: 'stain-preservativo',
    name: 'Stain Preservativo',
    category: 'Vernizes',
    description: 'Proteção que penetra na madeira, não descasca.',
    finish: 'Natural',
    yieldPerLiter: 14,
    pricePerLiter: 95,
    pricePerCan: 330,
    pricePerBucket: 1150,
    colors: [
      { name: 'Incolor', hex: 'rgba(255,255,255,0.1)', code: '0.001' },
      { name: 'Imbuia', hex: '#4B3621', code: '0.002' },
      { name: 'Mogno', hex: '#4E1609', code: '0.003' },
    ],
    info: 'Ideal para decks e móveis de jardim. Ação fungicida e hidrorrepelente.'
  },
  // IMPERMEABILIZANTES
  {
    id: 'rubber-paint',
    name: 'Tinta Emborrachada Premium',
    category: 'Impermeabilizantes',
    description: 'Previne microfissuras e infiltrações.',
    finish: 'Fosco',
    yieldPerLiter: 9,
    pricePerLiter: 85,
    pricePerCan: 295,
    pricePerBucket: 1050,
    colors: [
      { name: 'Branco Puro', hex: '#FFFFFF', code: '1.001.84' },
      { name: 'Branco Geada', hex: '#E8EAE6', code: '1.002.84' },
      { name: 'Cinza Médio', hex: '#95A5A6', code: '7.010.84' },
    ],
    info: 'Filme elástico que acompanha a movimentação da estrutura. Reduz calor e ruído.'
  },
  {
    id: 'tile-resin',
    name: 'Resina para Telhas e Pedras',
    category: 'Impermeabilizantes',
    description: 'Proteção e brilho para superfícies porosas.',
    finish: 'Brilhante',
    yieldPerLiter: 10,
    pricePerLiter: 70,
    pricePerCan: 245,
    pricePerBucket: 860,
    colors: [
      { name: 'Incolor', hex: 'rgba(255,255,255,0.1)', code: '0.001' },
      { name: 'Cerâmica', hex: '#B22222', code: '0.005' },
      { name: 'Cinza', hex: '#95A5A6', code: '7.010.84' },
    ],
    info: 'Impermeabiliza e protege contra mofo e sujeira.'
  }
];
