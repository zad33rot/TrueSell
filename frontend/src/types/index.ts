export interface Ad {
  id: number;
  title: string;
  price: number;
  isPrivate: boolean;
  image: string;
  description: string;
  sellerName: string;
  canBarter: boolean;
}

export type ViewState = 'home' | 'adDetails' | 'profile' | 'createAd' | 'register';

export type ProfileTab = 'myAds' | 'tickets';