// Dados iniciais da Loja Aurora. Tudo fictício. As datas das encomendas são relativas ao momento em que
// os dados são criados, para o painel do backoffice ter sempre atividade recente.

export const CATEGORIES = [
  { id: "computadores", name: "Computadores" },
  { id: "telemoveis", name: "Telemóveis" },
  { id: "audio", name: "Áudio" },
  { id: "casa", name: "Casa Inteligente" },
  { id: "gaming", name: "Gaming" },
  { id: "acessorios", name: "Acessórios" },
];

const COLORS = (...names) => ({ label: "Cor", options: names.map((name) => ({ name, delta: 0 })) });
const STORAGE = (...pairs) => ({
  label: "Armazenamento",
  options: pairs.map(([name, delta]) => ({ name, delta })),
});

const PRODUCTS = [
  ["Portátil Aurora Book 14", "computadores", 899, 999, 12, 4.6, STORAGE(["512 GB", 0], ["1 TB", 120]), true,
    "Portátil leve de 14 polegadas, com ecrã 2,8K e autonomia até 15 horas. Ideal para trabalho e estudo.",
    { Ecrã: "14\" 2,8K OLED", Processador: "8 núcleos, 4,7 GHz", Memória: "16 GB", Peso: "1,2 kg" }],
  ["Portátil Aurora Book 16 Pro", "computadores", 1499, null, 4, 4.8, STORAGE(["1 TB", 0], ["2 TB", 200]), true,
    "Portátil de 16 polegadas para criadores, com gráfica dedicada e ecrã de 165 Hz.",
    { Ecrã: "16\" 165 Hz", Processador: "12 núcleos, 5,1 GHz", Memória: "32 GB", Gráfica: "8 GB dedicada" }],
  ["Monitor UltraVisão 27\"", "computadores", 329, 379, 20, 4.4, null, false,
    "Monitor IPS de 27 polegadas, resolução QHD e suporte ajustável em altura.",
    { Resolução: "2560 × 1440", Painel: "IPS", Frequência: "75 Hz", Ligações: "HDMI, DisplayPort, USB-C" }],
  ["Teclado Mecânico Compacto", "computadores", 89.9, null, 0, 4.2, COLORS("Preto", "Branco"), false,
    "Teclado mecânico 75% com switches silenciosos e retroiluminação.",
    { Layout: "PT-PT", Switches: "Silenciosos", Ligação: "USB-C e Bluetooth" }],
  ["Smartphone Aurora X1", "telemoveis", 699, 799, 15, 4.5, STORAGE(["128 GB", 0], ["256 GB", 100], ["512 GB", 250]), true,
    "Smartphone com câmara tripla de 50 MP, ecrã de 6,5\" e carregamento rápido de 65 W.",
    { Ecrã: "6,5\" AMOLED 120 Hz", Câmara: "50 + 12 + 10 MP", Bateria: "5000 mAh", Rede: "5G" }],
  ["Smartphone Aurora Lite", "telemoveis", 249, null, 30, 4.0, COLORS("Azul", "Preto", "Verde"), false,
    "Smartphone acessível com bateria para dois dias e ecrã de 6,6\".",
    { Ecrã: "6,6\" LCD 90 Hz", Câmara: "48 MP", Bateria: "6000 mAh", Rede: "4G" }],
  ["Smartphone Dobrável Fold Z", "telemoveis", 1799, null, 2, 4.7, COLORS("Grafite", "Creme"), true,
    "Smartphone dobrável com ecrã interior de 7,6\" e caneta compatível.",
    { "Ecrã interior": "7,6\" AMOLED", "Ecrã exterior": "6,2\"", Bateria: "4400 mAh", Rede: "5G" }],
  ["Capa Antichoque X1", "telemoveis", 19.9, 24.9, 80, 4.1, COLORS("Transparente", "Preto"), false,
    "Capa com cantos reforçados e certificação de quedas até 2 metros.",
    { Compatibilidade: "Smartphone Aurora X1", Material: "TPU e policarbonato" }],
  ["Auscultadores SilêncioPro", "audio", 279, 349, 9, 4.7, COLORS("Preto", "Prateado"), true,
    "Auscultadores sem fios com cancelamento ativo de ruído e 30 horas de autonomia.",
    { Autonomia: "30 h", Cancelamento: "Ativo, adaptativo", Ligação: "Bluetooth 5.3" }],
  ["Auriculares Aurora Buds", "audio", 99, null, 40, 4.3, COLORS("Branco", "Preto"), false,
    "Auriculares compactos com estojo de carregamento sem fios.",
    { Autonomia: "6 h (+24 h com estojo)", Resistência: "IPX4" }],
  ["Coluna Portátil Onda", "audio", 69.9, 79.9, 3, 4.4, COLORS("Azul", "Vermelho", "Preto"), false,
    "Coluna Bluetooth resistente à água, ideal para a praia e a piscina.",
    { Potência: "20 W", Resistência: "IP67", Autonomia: "12 h" }],
  ["Gira-discos Vinil Clássico", "audio", 189, null, 6, 4.1, null, false,
    "Gira-discos com pré-amplificador integrado e saída Bluetooth.",
    { Velocidades: "33 e 45 rpm", Saídas: "RCA e Bluetooth" }],
  ["Assistente de Voz Casa Mini", "casa", 49.9, 59.9, 25, 4.2, COLORS("Carvão", "Areia"), true,
    "Coluna inteligente com assistente de voz para controlar a casa.",
    { Microfones: "4", Compatibilidade: "Wi-Fi, Bluetooth" }],
  ["Lâmpada Inteligente RGB (pack 2)", "casa", 29.9, null, 60, 4.0, null, false,
    "Duas lâmpadas E27 com 16 milhões de cores, controladas pela app ou por voz.",
    { Casquilho: "E27", Potência: "9 W (equivalente a 60 W)" }],
  ["Câmara de Segurança Exterior", "casa", 119, 139, 11, 4.3, null, false,
    "Câmara Full HD com visão noturna, deteção de pessoas e gravação na nuvem.",
    { Resolução: "1080p", Resistência: "IP65", Armazenamento: "Nuvem ou microSD" }],
  ["Termóstato Inteligente", "casa", 159, null, 0, 4.5, null, false,
    "Termóstato com programação semanal e relatórios de consumo.",
    { Compatibilidade: "Caldeiras e bombas de calor", Ecrã: "Tátil 3,5\"" }],
  ["Consola NovaPlay 5", "gaming", 499, 549, 7, 4.8, STORAGE(["825 GB", 0], ["2 TB", 120]), true,
    "Consola de nova geração com leitor de discos e comando sem fios.",
    { Resolução: "Até 4K 120 Hz", Leitor: "Blu-ray" }],
  ["Comando Sem Fios NovaPlay", "gaming", 69.9, null, 18, 4.4, COLORS("Branco", "Preto", "Vermelho"), false,
    "Comando com resposta tátil e gatilhos adaptativos.",
    { Ligação: "Bluetooth e USB-C", Autonomia: "12 h" }],
  ["Cadeira Gaming Ergonómica", "gaming", 229, 279, 5, 3.9, COLORS("Preto/Vermelho", "Preto/Azul"), false,
    "Cadeira com apoio lombar ajustável e reclinação até 155°.",
    { "Peso máximo": "130 kg", Reclinação: "90°–155°" }],
  ["Rato Gaming Precisão", "gaming", 49.9, null, 35, 4.6, null, false,
    "Rato com sensor de 26 000 DPI e 8 botões programáveis.",
    { Sensor: "26 000 DPI", Peso: "63 g" }],
  ["Carregador Rápido 65 W", "acessorios", 39.9, null, 50, 4.5, null, false,
    "Carregador USB-C GaN com duas portas, compatível com portáteis e telemóveis.",
    { Potência: "65 W", Portas: "2 × USB-C" }],
  ["Powerbank 20 000 mAh", "acessorios", 44.9, 54.9, 22, 4.2, COLORS("Preto", "Branco"), false,
    "Bateria externa com carregamento rápido e ecrã de percentagem.",
    { Capacidade: "20 000 mAh", Saídas: "USB-C e USB-A" }],
  ["Mochila para Portátil 15\"", "acessorios", 59.9, null, 14, 4.3, COLORS("Cinzento", "Preto"), false,
    "Mochila impermeável com compartimento acolchoado e porta USB.",
    { Capacidade: "22 L", Compatibilidade: "Portáteis até 15,6\"" }],
  ["Hub USB-C 7 em 1", "acessorios", 34.9, null, 1, 4.0, null, false,
    "Hub com HDMI 4K, leitor de cartões e carregamento passthrough.",
    { Portas: "HDMI, 3 × USB-A, SD, microSD, USB-C PD" }],
  ["Smartwatch Aurora Fit (descontinuado)", "acessorios", 129, null, 0, 3.8, null, false,
    "Modelo descontinuado. Não aparece na loja.",
    { Ecrã: "1,4\" AMOLED" }],
];

// Gerador pseudoaleatório determinístico: os mesmos dados em todas as máquinas.
function prng(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function daysAgo(now, days, hour = 10) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
}

const ADDRESSES = {
  ana: [
    { id: "m1", label: "Casa", name: "Ana Silva", line: "Avenida da República, 120, 3.º Esq.", postalCode: "1050-196", city: "Lisboa", phone: "912345678", isDefault: true },
    { id: "m2", label: "Férias", name: "Ana Silva", line: "Rua do Aljube, 5", postalCode: "9000-067", city: "Funchal", phone: "912345678", isDefault: false },
  ],
  bruno: [
    { id: "m3", label: "Casa", name: "Bruno Costa", line: "Rua de Santa Catarina, 300", postalCode: "4000-447", city: "Porto", phone: "936111222", isDefault: true },
  ],
};

export function buildSeed(now) {
  const products = PRODUCTS.map(([name, category, price, oldPrice, stock, rating, variants, featured, description, specs], i) => ({
    id: 101 + i,
    sku: `AUR-${1001 + i}`,
    name,
    category,
    price,
    oldPrice,
    stock,
    rating,
    variants,
    featured,
    description,
    specs,
    active: !name.includes("descontinuado"),
    image: null,
    createdAt: daysAgo(now, 120 - i * 4),
  }));

  const users = [
    { id: 1, name: "Ana Silva", email: "ana.silva@example.com", password: "Cliente#2026", role: "cliente", status: "ativo", phone: "912345678", nif: "123456789", addresses: ADDRESSES.ana, createdAt: daysAgo(now, 400) },
    { id: 2, name: "Bruno Costa", email: "bruno.costa@example.com", password: "Cliente#2026", role: "cliente", status: "ativo", phone: "936111222", nif: "", addresses: ADDRESSES.bruno, createdAt: daysAgo(now, 200) },
    { id: 3, name: "Marta Gestora", email: "gestor@example.com", password: "Gestor#2026", role: "gestor", status: "ativo", phone: "213000000", nif: "", addresses: [], createdAt: daysAgo(now, 800) },
    { id: 4, name: "Carlos Bloqueado", email: "bloqueado@example.com", password: "Cliente#2026", role: "cliente", status: "bloqueado", phone: "", nif: "", addresses: [], createdAt: daysAgo(now, 300) },
    { id: 5, name: "Diana Ferreira", email: "diana.ferreira@example.com", password: "Cliente#2026", role: "cliente", status: "ativo", phone: "961234567", nif: "", addresses: [
      { id: "m4", label: "Casa", name: "Diana Ferreira", line: "Praça da República, 10", postalCode: "3000-343", city: "Coimbra", phone: "961234567", isDefault: true },
    ], createdAt: daysAgo(now, 90) },
  ];

  const random = prng(2026);
  const customers = [users[0], users[1], users[4]];
  const statusPlan = [
    "Pendente", "Paga", "Paga", "Enviada", "Entregue", "Entregue", "Cancelada", "Paga", "Entregue", "Enviada",
    "Pendente", "Entregue", "Paga", "Entregue", "Cancelada", "Enviada", "Entregue", "Paga", "Entregue", "Entregue",
    "Pendente", "Enviada", "Entregue", "Paga", "Entregue", "Entregue", "Paga", "Enviada", "Entregue", "Paga",
  ];
  const sellable = products.filter((p) => p.active && p.stock > 0);
  const orders = statusPlan.map((_, i) => {
    const age = statusPlan.length - 1 - i;
    const status = statusPlan[age]; // as mais recentes ainda estão pendentes ou pagas
    const customer = customers[i % customers.length];
    const lines = [];
    const count = 1 + Math.floor(random() * 3);
    for (let n = 0; n < count; n++) {
      const product = sellable[Math.floor(random() * sellable.length)];
      if (lines.some((line) => line.productId === product.id)) continue;
      const option = product.variants ? product.variants.options[Math.floor(random() * product.variants.options.length)] : null;
      lines.push({
        productId: product.id,
        name: product.name,
        variant: option ? `${product.variants.label}: ${option.name}` : null,
        unitPrice: product.price + (option?.delta ?? 0),
        quantity: 1 + Math.floor(random() * 2),
      });
    }
    const subtotal = round(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
    const shippingCost = subtotal >= 50 ? 0 : 3.99;
    // números crescentes com o tempo: a AUR-2026-00030 é a mais recente
    const createdAt = daysAgo(now, Math.floor(age * 1.6) + (age % 3), 9 + (i % 9));
    const payment = status === "Pendente"
      ? { method: "multibanco", entity: "21054", reference: `${100 + i} ${200 + i} ${300 + i}` }
      : i % 2 === 0
        ? { method: "cartao", last4: "4242", holder: customer.name }
        : { method: "mbway", phone: customer.phone };
    const address = customer.addresses[0];
    const history = buildHistory(status, createdAt, payment.method);
    return {
      id: `AUR-2026-${String(i + 1).padStart(5, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      email: customer.email,
      createdAt,
      status,
      lines,
      subtotal,
      discount: 0,
      coupon: null,
      shipping: { method: "normal", cost: shippingCost, address: { ...address } },
      payment,
      total: round(subtotal + shippingCost),
      tracking: ["Enviada", "Entregue"].includes(status) ? `RR${String(100000000 + i * 7919).slice(0, 9)}PT` : null,
      cancelReason: status === "Cancelada" ? "Pedido do cliente" : null,
      history,
      notes: [],
    };
  });
  orders.reverse(); // mais recentes primeiro

  const reviews = [
    { id: 1, productId: 101, userId: 2, author: "Bruno Costa", rating: 5, title: "Excelente para trabalhar", comment: "Leve, rápido e a bateria dura o dia todo. Recomendo.", createdAt: daysAgo(now, 30) },
    { id: 2, productId: 101, userId: 5, author: "Diana Ferreira", rating: 4, title: "Muito bom", comment: "O ecrã é fantástico, só aquece um pouco em jogos.", createdAt: daysAgo(now, 12) },
    { id: 3, productId: 105, userId: 5, author: "Diana Ferreira", rating: 5, title: "Câmara top", comment: "As fotografias noturnas são impressionantes para o preço.", createdAt: daysAgo(now, 20) },
    { id: 4, productId: 109, userId: 2, author: "Bruno Costa", rating: 5, title: "Silêncio total", comment: "O cancelamento de ruído funciona mesmo bem no comboio.", createdAt: daysAgo(now, 8) },
    { id: 5, productId: 117, userId: 5, author: "Diana Ferreira", rating: 4, title: "Boa consola", comment: "Rápida e silenciosa, mas o armazenamento enche depressa.", createdAt: daysAgo(now, 3) },
  ];

  const coupons = [
    { code: "AURORA10", type: "percent", value: 10, minSubtotal: 30, expiresAt: daysAgo(now, -60), freeShipping: false },
    { code: "BEMVINDO5", type: "amount", value: 5, minSubtotal: 20, expiresAt: daysAgo(now, -60), freeShipping: false },
    { code: "PORTESGRATIS", type: "shipping", value: 0, minSubtotal: 0, expiresAt: daysAgo(now, -60), freeShipping: true },
    { code: "VERAO2026", type: "percent", value: 15, minSubtotal: 0, expiresAt: daysAgo(now, 90), freeShipping: false },
  ];

  const stores = [
    { id: "lisboa", name: "Loja Aurora Lisboa (Saldanha)" },
    { id: "porto", name: "Loja Aurora Porto (Boavista)" },
    { id: "braga", name: "Loja Aurora Braga (Centro)" },
  ];

  return { products, users, orders, reviews, coupons, stores, categories: CATEGORIES };
}

function buildHistory(status, createdAt, method) {
  const flow = ["Pendente", "Paga", "Enviada", "Entregue"];
  const at = (hours) => new Date(new Date(createdAt).getTime() + hours * 3600000).toISOString();
  if (status === "Cancelada") {
    return [
      { status: "Pendente", at: createdAt, by: "Cliente" },
      { status: "Cancelada", at: at(5), by: "Cliente" },
    ];
  }
  const steps = flow.slice(0, flow.indexOf(status) + 1);
  if (method !== "multibanco" && steps.length > 1) steps.shift(); // cartão e MB WAY ficam logo pagas
  return steps.map((step, i) => ({ status: step, at: at(i * 26), by: i === 0 ? "Cliente" : "Marta Gestora" }));
}

function round(value) {
  return Math.round(value * 100) / 100;
}
