// 1. STAMP DATABASE
const stamps = [
    { 
        name: "World stamps", 
        country: "worldwide", 
        year: "1970 onwards", 
        priceINR: 8999, 
        isSoldOut: false,
        folder: "world-stamps",
        imageCount: 31,
        //images: ["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=2"],
        desc: "RN4057: Thick stockbook with stamp collection various.Check the photos. What you see is what you get.(+ shipping Inside India in April 2026).Thick album for free" 
    },
    { 
        name: "350 different Dutch Antilles and Suriname FDC's", 
        country: "Dutch Antilles and Suriname", 
        year: "1965+", 
        priceINR: 17500, 
        isSoldOut: true,
        folder: "FDC",
        imageCount: 23,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4059:3 Luxureous Importa albums in excellent condition with collection about 350 FDC covers Dutch Antilles and Suriname. Check the photos to see a small part, but there is a lot more than you can see here.Three albums for FREE + shipping inside India in April 2026" 
    },
    { 
        name: "TinTin FDC and MS", 
        country: "Netherlands", 
        year: "1999", 
        priceINR: 899, 
        isSoldOut: false,
        folder: "RN4043",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4043: FDC and miniature sheet from Netherlands.(Free letter post shipping worldwide)"
    },
    { 
        name: "60 FDC's from Switzerland", 
        country: "Switzerland", 
        year: "various", 
        priceINR: 3000, 
        isSoldOut: false,
        folder: "RN4051",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4051: 60 different FDC from Switzerland. (+ shipping inside India in April 2026)"
    },
    { 
        name: "Used stamps lot", 
        country: "Different countries", 
        year: "various", 
        priceINR: 899, 
        isSoldOut: false,
        folder: "RN4056",
        imageCount: 4,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4056: Used stamps from around the world. ( Free letter post shipping worldwide from Netherlands)"
    },
    { 
        name: "Indipex 73' India International Philatelic Exhibition", 
        country: "India", 
        year: "1973", 
        priceINR: 999, 
        isSoldOut: false,
        folder: "001",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4060: MNH MS from India( Free letter post shipping worldwide from Netherlands)"
    },
    { 
        name: "Indian Masks Series", 
        country: "India", 
        year: "1975", 
        priceINR: 999, 
        isSoldOut: false,
        folder: "002",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4061: MNH MS from India( Free letter post shipping worldwide from Netherlands)"
    },
    { 
        name: "UPU Centenary", 
        country: "India", 
        year: "1974", 
        priceINR: 1820, 
        isSoldOut: false,
        folder: "003",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4062: MNH MS from India( Free letter post shipping worldwide from Netherlands)"
    },
    { 
        name: "India 89' world philatelic exhibition", 
        country: "India", 
        year: "1989", 
        priceINR: 270, 
        isSoldOut: false,
        folder: "004",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4063: MNH MS from India( Free letter post shipping worldwide from Netherlands)"
    },
    { 
        name: "India 89' world philatelic exhibition MS2", 
        country: "India", 
        year: "1989", 
        priceINR: 270, 
        isSoldOut: false,
        folder: "005",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4064: MNH MS from India( Free letter post shipping worldwide from Netherlands)"
    },
    { 
        name: "Mahatma Gandhi South Africa joint issue", 
        country: "India", 
        year: "1995", 
        priceINR: 270, 
        isSoldOut: false,
        folder: "006",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4065: MNH MS from India( Free letter post shipping worldwide from Netherlands)"
    }
];
