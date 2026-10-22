export interface SampleLandmark {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  hint: string;
  presetCoordinates: { latitude: number; longitude: number };
}

export const SAMPLE_LANDMARKS: SampleLandmark[] = [
  {
    id: 'eiffel-tower',
    name: 'Eiffel Tower',
    city: 'Paris',
    country: 'France',
    category: 'Iron Lattice Tower',
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=400&q=80',
    hint: 'Gustave Eiffel’s 1889 Universal Exposition masterpiece on the Champ de Mars.',
    presetCoordinates: { latitude: 48.8584, longitude: 2.2945 },
  },
  {
    id: 'colosseum',
    name: 'The Colosseum',
    city: 'Rome',
    country: 'Italy',
    category: 'Ancient Amphitheatre',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80',
    hint: 'Flavian amphitheatre in central Rome, inaugurated c. 80 AD by Emperor Titus.',
    presetCoordinates: { latitude: 41.8902, longitude: 12.4922 },
  },
  {
    id: 'sagrada-familia',
    name: 'Basílica de la Sagrada Família',
    city: 'Barcelona',
    country: 'Spain',
    category: 'Modernisme / Catalan Gothic',
    imageUrl: 'https://images.unsplash.com/photo-1583779457319-5d6666eb971f?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583779457319-5d6666eb971f?auto=format&fit=crop&w=400&q=80',
    hint: 'Antoni Gaudí’s organic unfinished basilica begun in 1882.',
    presetCoordinates: { latitude: 41.4036, longitude: 2.1744 },
  },
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    city: 'Agra',
    country: 'India',
    category: 'Mughal Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80',
    hint: 'White marble mausoleum commissioned by Shah Jahan in 1632 for Mumtaz Mahal.',
    presetCoordinates: { latitude: 27.1751, longitude: 78.0421 },
  },
  {
    id: 'big-ben',
    name: 'Elizabeth Tower (Big Ben)',
    city: 'London',
    country: 'United Kingdom',
    category: 'Gothic Revival',
    imageUrl: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=400&q=80',
    hint: 'Iconic neo-Gothic clock tower at the north end of the Houses of Parliament.',
    presetCoordinates: { latitude: 51.5007, longitude: -0.1246 },
  },
  {
    id: 'fushimi-inari',
    name: 'Fushimi Inari-taisha',
    city: 'Kyoto',
    country: 'Japan',
    category: 'Shinto Shrine',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
    hint: 'Mount Inari paths lined with thousands of vermilion torii gates dating back to 711 AD.',
    presetCoordinates: { latitude: 34.9671, longitude: 135.7727 },
  },
  {
    id: 'brooklyn-bridge',
    name: 'Brooklyn Bridge',
    city: 'New York City',
    country: 'United States',
    category: 'Hybrid Cable-stayed Suspension Bridge',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc225?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc225?auto=format&fit=crop&w=400&q=80',
    hint: 'John & Washington Roebling’s 1883 neo-Gothic limestone towers spanning the East River.',
    presetCoordinates: { latitude: 40.7061, longitude: -73.9969 },
  },
  {
    id: 'parthenon',
    name: 'The Parthenon',
    city: 'Athens',
    country: 'Greece',
    category: 'Classical Doric Temple',
    imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=400&q=80',
    hint: '5th-century BC temple dedicated to goddess Athena atop the Acropolis citadel.',
    presetCoordinates: { latitude: 37.9715, longitude: 23.7267 },
  },
];
