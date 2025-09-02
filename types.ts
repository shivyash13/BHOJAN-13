export interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  img: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface LocationState {
  lat: number | null;
  lng: number | null;
  mapsUrl: string | null;
}
