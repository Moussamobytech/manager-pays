import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchSynonymsService {
  // Dictionary mapping common terms to formal product type identifiers
  private synonymDict: Record<string, Record<string, string[]>> = {
    // FASHION & BEAUTY CATEGORY
    'fashion-beauty': {
      // Clothing
      'bomber': ['coat', 'blazer', 'blouson', 'veste', 'manteau','jacket'],
      'shirt': ['top', 'tee', 't-shirt', 'chemise', 'haut', 'blouse', 'polo', 'button-up', 'button-down'],
      'sweater': ['pullover', 'jumper', 'pull', 'cardigan', 'sweatshirt', 'hoodie', 'turtleneck', 'v-neck', 'crewneck'],
      'pants': ['trousers', 'jeans', 'slacks', 'pantalon', 'jean', 'shorts', 'chinos'],
      'skirt': ['jupe', 'mini-skirt', 'maxi-skirt'],
      'dress': ['gown', 'robe', 'sundress', 'shift', 'a-line'],
      'suit': ['tuxedo', 'costume', 'ensemble', 'blazer'],
      'underwear': ['lingerie', 'boxers', 'briefs', 'bra', 'panties', 'caleçon', 'sous-vêtements'],
      'swimwear': ['swimsuit', 'bikini', 'trunks', 'maillot de bain', 'maillot'],
      'socks': ['stockings', 'chaussettes'],
      'sleepwear': ['pajamas', 'pyjamas', 'nightgown', 'robe de nuit'],

      // Footwear
      'shoes': ['footwear', 'sneakers', 'boots', 'flats', 'heels', 'chaussures', 'baskets', 'sandals', 'loafers', 'bottines', 'bottes', 'sandales', 'talons', 'espadrilles', 'mocassins'],
      'boots': ['ankle boots', 'bottes', 'bottines', 'winter boots', 'hiking boots', 'chelsea'],
      'sneakers': ['athletic shoes', 'running shoes', 'trainers', 'tennis shoes', 'baskets'],
      'heels': ['pumps', 'stilettos', 'high heels', 'talons', 'platforms'],

      // Accessories
      'bag': ['handbag', 'purse', 'backpack', 'tote', 'sac', 'sac à main', 'sac à dos', 'wallet', 'clutch'],
      'hat': ['cap', 'beanie', 'chapeau', 'casquette', 'bonnet', 'fedora', 'beret'],
      'scarf': ['wrap', 'shawl', 'écharpe', 'foulard'],
      'gloves': ['mittens', 'gants'],
      'belt': ['ceinture', 'sash'],
      'tie': ['necktie', 'bowtie', 'cravate', 'noeud papillon'],
      'glasses': ['eyeglasses', 'sunglasses', 'lunettes', 'lunettes de soleil', 'sunnies'],
      'jewelry': ['necklace', 'bracelet', 'earrings', 'ring', 'bijoux', 'montre', 'watch'],

      // Beauty
      'makeup': ['cosmetics', 'maquillage', 'lipstick', 'foundation', 'mascara', 'eyeshadow'],
      'lipstick': ['rouge à lèvres', 'lip gloss', 'lip balm'],
      'foundation': ['base', 'fond de teint', 'concealer', 'correcteur'],
      'mascara': ['eyeliner', 'eye makeup'],
      'nail polish': ['vernis à ongles', 'nail color', 'nail varnish'],
      'perfume': ['fragrance', 'cologne', 'parfum', 'eau de toilette'],
      'skincare': ['moisturizer', 'serum', 'cleanser', 'crème', 'hydratant', 'soin de la peau'],
      'haircare': ['shampoo', 'conditioner', 'shampooing', 'après-shampooing', 'hair treatment'],
    },

    // HEALTH & WELLNESS CATEGORY
    'health-wellness': {
      'vitamins': ['supplements', 'multivitamins', 'vitamines', 'compléments alimentaires'],
      'protein': ['protein powder', 'whey', 'protéine', 'shake', 'supplement'],
      'fitness': ['exercise', 'workout', 'training', 'exercice', 'entraînement'],
      'weights': ['dumbbells', 'barbells', 'kettlebells', 'haltères', 'poids'],
      'yoga': ['mat', 'tapis de yoga', 'blocks', 'straps'],
      'medicine': ['medication', 'pills', 'tablets', 'médicament', 'comprimé'],
      'first aid': ['bandages', 'gauze', 'premiers secours', 'bandages', 'pansements'],
      'thermometer': ['temperature', 'fever', 'thermomètre', 'fièvre'],
      'massage': ['massager', 'massage device', 'appareil de massage'],
      'sleep': ['sleep aid', 'melatonin', 'aide au sommeil'],
      'essential oils': ['diffuser', 'aromatherapy', 'huiles essentielles', 'aromathérapie'],
      'dental': ['toothbrush', 'toothpaste', 'floss', 'brosse à dents', 'dentifrice', 'fil dentaire'],
      'skincare': ['face mask', 'face cream', 'moisturizer', 'crème visage', 'masque visage'],
    },

    // ELECTRONICS CATEGORY
    'electronics': {
      'smartphone': ['phone', 'mobile', 'téléphone', 'portable', 'cellphone', 'iphone', 'android'],
      'laptop': ['notebook', 'ordinateur portable', 'computer', 'macbook', 'chromebook'],
      'desktop': ['computer', 'pc', 'ordinateur', 'tour'],
      'tablet': ['ipad', 'tablette', 'slate'],
      'tv': ['television', 'télévision', 'smart tv', 'led tv', 'oled'],
      'headphones': ['earbuds', 'earphones', 'casque', 'écouteurs', 'airpods', 'wireless headphones'],
      'speaker': ['bluetooth speaker', 'enceinte', 'sound system', 'haut-parleur', 'sonos', 'bose'],
      'camera': ['digital camera', 'dslr', 'appareil photo', 'caméra', 'webcam'],
      'smartwatch': ['watch', 'fitness tracker', 'montre connectée', 'apple watch', 'fitbit'],
      'gaming': ['console', 'playstation', 'xbox', 'nintendo', 'switch', 'jeux vidéo', 'manette', 'controller'],
      'printer': ['scanner', 'imprimante', 'all-in-one'],
      'monitor': ['display', 'screen', 'écran', 'moniteur'],
      'router': ['wifi', 'modem', 'network', 'routeur', 'réseau'],
      'charger': ['power adapter', 'cable', 'chargeur', 'câble', 'power bank'],
      'accessory': ['case', 'étui', 'cover', 'screen protector', 'keyboard', 'mouse', 'souris', 'clavier'],
      'home automation': ['smart home', 'maison connectée', 'smart speaker', 'alexa', 'google home'],
    },

    // FURNITURE & HOME CATEGORY
    'furniture-home': {
      'sofa': ['couch', 'canapé', 'sectional', 'loveseat', 'divan'],
      'chair': ['armchair', 'chaise', 'fauteuil', 'recliner', 'accent chair'],
      'table': ['desk', 'dining table', 'coffee table', 'console', 'bureau', 'table à manger', 'table basse'],
      'bed': ['mattress', 'lit', 'matelas', 'bedframe', 'sommier', 'bunk bed', 'lit superposé'],
      'dresser': ['chest of drawers', 'commode', 'drawer', 'tiroir', 'armoire'],
      'bookshelf': ['shelving', 'étagère', 'bookcase', 'bibliothèque'],
      'cabinet': ['storage', 'cupboard', 'meuble', 'placard', 'rangement'],
      'lighting': ['lamp', 'light fixture', 'lampe', 'luminaire', 'chandelier', 'floor lamp', 'table lamp'],
      'rug': ['carpet', 'area rug', 'tapis', 'moquette'],
      'curtains': ['drapes', 'blinds', 'rideaux', 'stores', 'voilage'],
      'pillow': ['cushion', 'oreiller', 'coussin'],
      'blanket': ['throw', 'couverture', 'plaid', 'duvet', 'comforter'],
      'decor': ['decoration', 'wall art', 'vase', 'décoration', 'cadre', 'frame', 'mirror', 'miroir'],
      'kitchenware': ['cookware', 'ustensiles', 'pots', 'pans', 'casseroles', 'poêles'],
      'dinnerware': ['plates', 'bowls', 'assiettes', 'bols', 'vaisselle', 'cutlery', 'couverts'],
      'appliance': ['kitchen appliance', 'appareil électroménager', 'blender', 'mixer', 'toaster', 'coffee maker'],
      'bathroom': ['shower', 'bath', 'toilet', 'douche', 'bain', 'toilette', 'salle de bain'],
    },

    // AUTOMOTIVE CATEGORY
    'automotive': {
      'car': ['auto', 'vehicle', 'voiture', 'véhicule', 'automobile'],
      'truck': ['pickup', 'camion', 'pickup truck'],
      'suv': ['crossover', 'sport utility vehicle', '4x4'],
      'motorcycle': ['bike', 'moto', 'scooter', 'motocyclette'],
      'bicycle': ['bike', 'vélo', 'cycling', 'mountain bike', 'road bike'],
      'tire': ['wheel', 'pneu', 'roue', 'rim', 'jante'],
      'oil': ['motor oil', 'lubricant', 'huile moteur', 'lubrifiant'],
      'battery': ['car battery', 'batterie', 'accumulateur'],
      'spark plug': ['plug', 'bougie', 'bougie d\'allumage'],
      'brake': ['brake pad', 'brake disc', 'frein', 'plaquette de frein', 'disque de frein'],
      'filter': ['air filter', 'oil filter', 'filtre', 'filtre à air', 'filtre à huile'],
      'wiper': ['windshield wiper', 'essuie-glace'],
      'headlight': ['light', 'phare', 'lumière', 'bulb', 'ampoule'],
      'car accessory': ['accessoire auto', 'car mat', 'tapis de voiture', 'seat cover', 'housse de siège'],
      'car care': ['car wash', 'polish', 'wax', 'soin auto', 'lavage', 'polish', 'cire'],
      'tools': ['automotive tools', 'wrench', 'screwdriver', 'outils', 'clé', 'tournevis'],
    },

    // TECHNOLOGY & GADGETS (beyond electronics)
    'tech-gadgets': {
      'drone': ['quadcopter', 'uav', 'drone'],
      'vr': ['virtual reality', 'vr headset', 'réalité virtuelle', 'oculus'],
      'smart device': ['connected device', 'appareil connecté', 'iot', 'internet of things'],
      'wearable': ['wearable tech', 'technologie portable', 'fitness tracker'],
      'audio': ['sound system', 'système audio', 'stereo', 'home theater'],
      'ebook': ['e-reader', 'kindle', 'liseuse', 'livre électronique'],
      'power bank': ['portable charger', 'batterie externe', 'battery pack'],
      'projector': ['video projector', 'projecteur', 'vidéoprojecteur'],
      'storage': ['hard drive', 'ssd', 'usb drive', 'memory card', 'disque dur', 'clé usb', 'carte mémoire'],
    },

    // SPORTS & OUTDOOR
    'sports-outdoor': {
      'camping': ['tent', 'sleeping bag', 'tente', 'sac de couchage', 'backpack', 'hiking'],
      'fishing': ['rod', 'reel', 'tackle', 'canne à pêche', 'moulinet', 'appât'],
      'hunting': ['rifle', 'scope', 'chasse', 'fusil', 'lunette de visée'],
      'team sports': ['soccer', 'football', 'basketball', 'baseball', 'volleyball'],
      'water sports': ['swimming', 'surfing', 'kayaking', 'natation', 'surf', 'kayak'],
      'winter sports': ['skiing', 'snowboarding', 'ski', 'snowboard', 'snow'],
      'golf': ['golf club', 'club de golf', 'driver', 'putter', 'iron'],
      'tennis': ['racket', 'raquette', 'tennis ball', 'balle de tennis'],
      'fitness equipment': ['exercise equipment', 'home gym', 'équipement de fitness', 'treadmill', 'tapis roulant'],
      'sportswear': ['athletic wear', 'vêtements de sport', 'jersey', 'maillot'],
    },

    // TOYS & KIDS
    'toys-kids': {
      'toy': ['jouet', 'game', 'jeu', 'play', 'action figure', 'figurine'],
      'doll': ['barbie', 'action figure', 'poupée', 'figurine'],
      'board game': ['card game', 'jeu de société', 'jeu de cartes', 'puzzle'],
      'lego': ['building blocks', 'construction toy', 'briques', 'construction'],
      'stuffed animal': ['plush', 'teddy bear', 'peluche', 'nounours', 'ourson'],
      'baby': ['infant', 'bébé', 'newborn', 'nouveau-né', 'toddler'],
      'stroller': ['pushchair', 'poussette', 'baby carriage'],
      'car seat': ['baby seat', 'siège auto', 'siège enfant'],
      'diaper': ['nappy', 'couche', 'pampers'],
      'bottle': ['baby bottle', 'biberon', 'feeding'],
      'kids clothing': ['children\'s clothing', 'vêtements enfants', 'baby clothes'],
    }
  };

  constructor() { }

  /**
   * Find expanded terms for a search query
   * Searches across all categories and returns relevant formal terms
   * @param term The search term entered by the user
   * @returns Array of formal product terms related to the search term
   */
  public expandTerm(term: string): string[] {
    const normalizedTerm = term.toLowerCase().trim();
    let expandedTerms: string[] = [];

    // First try direct matches in any category
    for (const category in this.synonymDict) {
      for (const formalTerm in this.synonymDict[category]) {
        // Check if the formal term matches the search term
        if (formalTerm === normalizedTerm) {
          expandedTerms.push(formalTerm, ...this.synonymDict[category][formalTerm]);
          continue;
        }

        // Check if the search term is in the synonyms list
        if (this.synonymDict[category][formalTerm].some(synonym =>
          synonym === normalizedTerm ||
          synonym.includes(normalizedTerm) ||
          normalizedTerm.includes(synonym)
        )) {
          expandedTerms.push(formalTerm, ...this.synonymDict[category][formalTerm]);
        }
      }
    }

    // If no direct matches, try partial matches for terms over 3 characters
    if (expandedTerms.length === 0 && normalizedTerm.length > 3) {
      for (const category in this.synonymDict) {
        for (const formalTerm in this.synonymDict[category]) {
          // Check if formal term contains the search term
          if (formalTerm.includes(normalizedTerm)) {
            expandedTerms.push(formalTerm, ...this.synonymDict[category][formalTerm]);
            continue;
          }

          // Check if any synonym contains the search term
          if (this.synonymDict[category][formalTerm].some(synonym =>
            synonym.includes(normalizedTerm) && synonym.length > 3
          )) {
            expandedTerms.push(formalTerm, ...this.synonymDict[category][formalTerm]);
          }
        }
      }
    }

    // Remove duplicates and return
    return [...new Set(expandedTerms)];
  }
}
