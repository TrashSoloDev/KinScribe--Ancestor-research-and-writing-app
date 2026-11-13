export interface ScrapbookItem {
  id: string;
  title: string;
  category: 'photograph' | 'document' | 'map' | 'church';
  year: string;
  location: string;
  description: string;
  associatedAncestorId?: string;
  sourceAttribution: string;
  imageUrl: string;
  aspectRatio?: string;
}

export const SCRAPBOOK_STORAGE_KEY = 'kinscribe_scrapbook_items_v1';

export const INITIAL_SCRAPBOOK_ITEMS: ScrapbookItem[] = [
  {
    id: 'scrap_1',
    title: 'Traditional Barbadian Flying Fish Sloop at Fitts Village',
    category: 'photograph',
    year: 'c. 1935',
    location: 'Fitts Village Beach, St. James, Barbados',
    description: 'An open-cockpit wooden flying fish day-boat resting on the coral sand at Fitts Village. Built with local white cedar frames and pine planking, identical to the craft fashioned by Ancil Scott.',
    associatedAncestorId: 'indi_ancil_scott',
    sourceAttribution: 'Barbados Museum & Historical Society Maritime Archive',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'scrap_2',
    title: 'Historic St. James Parish Church, Holetown',
    category: 'church',
    year: 'Established 1628',
    location: 'Holetown, St. James Parish, Barbados',
    description: 'The historic Anglican sanctuary where generations of the Scott, Baird, Alleyne, and Ward families were baptized, wed, and laid to rest in the seaside churchyard overlooking the Caribbean reef.',
    associatedAncestorId: 'indi_joseph_scott',
    sourceAttribution: 'Anglican Diocese of Barbados Records / St. James Vestry',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-195973b1ff0c?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'scrap_3',
    title: 'Handwritten Freehold Land Conveyance Deed (1898)',
    category: 'document',
    year: '1898',
    location: 'Registrar of Titles, Bridgetown & St. James Parish',
    description: 'Official deed documenting Samuel Thomas Scott’s purchase of coastal land bounded by the public highway and the high-water sea mark, solidifying the family homestead in Fitts Village.',
    associatedAncestorId: 'indi_samuel_scott',
    sourceAttribution: 'Barbados Department of Archives (Black Rock, St. Michael), Deeds Vol 1898-C',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'scrap_4',
    title: 'Seine Net Fishermen Gathering on the West Coast Beach',
    category: 'photograph',
    year: 'c. 1928',
    location: 'Paynes Bay & Fitts Village shoreline',
    description: 'Village fishermen hauling a heavy seine net from the calm turquoise waters of St. James. Cooper Joseph Nathaniel Scott and his neighbors shared the catch in the shade of sea-grape trees.',
    associatedAncestorId: 'indi_joseph_scott',
    sourceAttribution: 'West India Committee Archives / Private Family Collection',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'scrap_5',
    title: 'SS Colombie Passenger Liner at Carlisle Bay',
    category: 'document',
    year: '1955',
    location: 'Port of Bridgetown, Barbados',
    description: 'The transatlantic French Line passenger ship SS Colombie anchored off Bridgetown, carrying Barbadian artisans, craftsmen, and trade ambassadors to the United Kingdom and North America.',
    associatedAncestorId: 'indi_ancil_scott',
    sourceAttribution: 'UK National Archives (Kew), Board of Trade Passenger Manifest BT26/1332',
    imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80'
  }
];
