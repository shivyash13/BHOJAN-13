export const MERCHANT_NUMBER_LOCAL = '8080935258';
export const MERCHANT_FULL = '91' + MERCHANT_NUMBER_LOCAL.replace(/\D/g, '');

export const SANITY_PROJECT_ID = "1c72zgt0";
export const SANITY_DATASET = "production";
export const SANITY_QUERY = encodeURIComponent('*[_type == "menuItem"]{name, desc, price, "id": _id, "img": img.asset->url}');
export const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${SANITY_QUERY}`;

export const placeholderImage = (seed: string = '') => {
  const s = encodeURIComponent(seed || 'food');
  return `https://picsum.photos/seed/${s}/600/400`;
};

export const sampleMenu = () => [
  { id: 'm1', name: 'Paneer Butter Masala', desc: 'Creamy paneer with rich tomato gravy', price: 180, img: placeholderImage('Paneer Butter Masala') },
  { id: 'm2', name: 'Veg Biryani', desc: 'Fragrant basmati rice with veggies and spices', price: 150, img: placeholderImage('Veg Biryani') },
  { id: 'm3', name: 'Chicken Curry', desc: 'Traditional spicy chicken curry', price: 220, img: placeholderImage('Chicken Curry') },
  { id: 'm4', name: 'Masala Dosa', desc: 'Crispy dosa with lightly spiced potato filling', price: 90, img: placeholderImage('Masala Dosa') },
  { id: 'm5', name: 'Schezwan Noodles', desc: 'Spicy Indo-Chinese stir fry noodles', price: 140, img: placeholderImage('Schezwan Noodles') }
];
