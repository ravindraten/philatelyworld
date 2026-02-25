// 1. STAMP DATABASE
const stamps = [
    { 
        name: "Eastern European used stamp collection", 
        country: "Jugoslavia,Romania,Bulgaria,Poland, Russia", 
        year: "", 
        priceINR: 899,
        isSoldOut: true,
        folder: "D13",
        imageCount: 14,
        desc: "RN4078: Collection of used stamps from different eastern european countries.\
            Check the photos. What you see is what you get. .\
            Free letter post shipping from Netherlands in FDC"
    },
    { 
        name: "Germany Bayern postal item collection 2", 
        country: "Germany Bayern", 
        year: "<b>Year</b>: 1870-1900", 
        priceINR: 9000,
        isSoldOut: false,
        folder: "D12",
        imageCount: 10,
        desc: "RN4077: Collection about 90 postal items with many postcards Bayern.\
            Check the photos. What you see is what you get. Price Per postal item <b>Rs.100</b>.\
            Total will be <b>Rs.9000</b> + shipping inside India in April 2026"
    },
    { 
        name: "Germany Bayern postal item collection 1", 
        country: "Germany Bayern", 
        year: "<b>Year</b>: 1870-1900", 
        priceINR: 10000,
        isSoldOut: false,
        folder: "D11",
        imageCount: 15,
        desc: "RN4076: Collection over 100 postal items with many postcards Bayern.\
            Check the photos. What you see is what you get. Price Per postal item <b>Rs.100</b>.\
            Total will be <b>Rs.10000</b> + shipping inside India in April 2026"
    },
    { 
        name: "Israel MNH stamp collection in stockbook", 
        country: "Israel", 
        year: "<b>Year</b>: Various", 
        priceINR: 6499,
        isSoldOut: false,
        folder: "D10",
        imageCount: 16,
        desc: "RN4075: Stockbook with stamp collection almost all MNH Israel.\
            Check the photos. What you see is what you get. Stock Album for free + shipping inside India in April 2026"
    },
    { 
        name: "Germany 1946-2003 stamp collection in album", 
        country: "Netherlands", 
        year: "<b>Year</b>: 1946-2003", 
        priceINR: 22000,
        isSoldOut: false,
        folder: "D9",
        imageCount: 41,
        desc: "RN4074: Davo album Germany 1946-2003 with very well filled used stamp collection.\
                Check the photos to see a small part, but there is a lot more than you can see here.\
                Stock Album for free + shipping inside India in April 2026"
    },
    { 
        name: "Around 550 FDC's from Netherlands", 
        country: "Netherlands", 
        year: "<b>Year</b>: 1965 - 1999", 
        priceINR: 22000,
        isSoldOut: false,
        folder: "D8",
        imageCount: 3,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4073: Around 550 FDCs from Netherlands Each FDC is atleast with 2 stamps on it.. \
        many are with whole miniature sheets. \
        Price: <b>Rs.40</b> per FDC. \
        Total will be <b>Rs.22000</b> \
        ( Free shipping worldwide with Track and Trace)"
    },
    { 
        name: "Complete set of 11 MS from India 2025", 
        country: "India", 
        year: "<b>Year</b>: 2025", 
        priceINR: 2150, 
        isSoldOut: false,
        folder: "D7",
        imageCount: 7,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4072: Complete set of MS from India + Free letter post shipping worldwide"
    },
    { 
        name: "Experience Nature - Butterflies of Sint Eustatius", 
        country: "Netherlands", 
        year: "<b>Year</b>: 2025", 
        priceINR: 1640, 
        isSoldOut: false,
        folder: "D6",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4071:On March 31, 2025, PostNL will release Experience Nature - Butterflies of Sint Eustatius, \
        a sheet of 10 stamps in 10 different designs. + shipping inside India in April 2026)"
    },
    { 
        name: "Experience Nature - Birds Sint Eustatius", 
        country: "Netherlands", 
        year: "<b>Year</b>: 2025", 
        priceINR: 1640, 
        isSoldOut: false,
        folder: "D5",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4070:On January 2, 2025, PostNL will release Experience Nature - Birds Sint Eustatius, \
        a sheet of 10 stamps in 10 different designs. + shipping inside India in April 2026)"
    },
    { 
        name: "Silver stamp – Dutch motorcycle brands – Eysink 1953", 
        country: "Netherlands", 
        year: "<b>Year</b>: 2025", 
        priceINR: 2770, 
        isSoldOut: false,
        folder: "D4",
        imageCount: 2,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4069:Designer Frank Janse is commemorating this Dutch motorcycle classic with a silver stamp, \
        presented in a luxurious mat. + shipping inside India in April 2026)"
    },
    { 
        name: "The Bull stamp sheet", 
        country: "Netherlands", 
        year: "<b>Year</b>: 2026", 
        priceINR: 770, 
        isSoldOut: false,
        folder: "D3",
        imageCount: 6,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4066: On January 15, 2026, PostNL will issue the The Bull stamp sheet featuring \
        the eponymous painting by Paulus Potter. + shipping inside India in April 2026)"
    },
    { 
        name: "Experience nature - birds Saba", 
        country: "Netherlands", 
        year: "<b>Year</b>: 2026", 
        priceINR: 1640, 
        isSoldOut: false,
        folder: "D2",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4067: On January 5, 2026, PostNL will release Experience Nature - Birds of Saba, \
        a sheet of 10 stamps in 10 different designs + shipping inside India in April 2026)"
    },
    { 
        name: "New Dutch Design – Terugkerende Herinneringen (Returning Memories)", 
        country: "Netherlands", 
        year: "<b>Year</b>: 2026", 
        priceINR: 990, 
        isSoldOut: false,
        folder: "D1",
        imageCount: 3,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4068: On February 16, 2026, PostNL will issue the New Dutch Design – Terugkerende Herinneringen \
        (Returning Memories) stamps, the first sheet of this year's New Dutch Design series.\
        (+ shipping inside India in April 2026)"
    },
    { 
        name: "Bundle - Crypto Stamp Heroes of Mythology", 
        country: "Portugal, Austria, Luxembourg, Belgium, Netherlands", 
        year: "<b>Year</b>: 2025", 
        priceINR: 9999, 
        isSoldOut: false,
        folder: "crypto",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4002: Bundle - Crypto Stamp Heroes of Mythology Portugal, Austria Post, Post Luxembourg, \
        bpost (Belgium) and PostNL (Netherlands).(Free shipping inside India in April 2026)"
    },
    { 
        name: "World stamps", 
        country: "worldwide", 
        year: "<b>Year</b>: 1970 onwards", 
        priceINR: 8999, 
        isSoldOut: false,
        folder: "world-stamps",
        imageCount: 31,
        //images: ["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=2"],
        desc: "RN4057: Thick stockbook with stamp collection various.Check the photos. \
        What you see is what you get.(+ shipping Inside India in April 2026).Thick album for free" 
    },
    { 
        name: "350 different Dutch Antilles and Suriname FDC's", 
        country: "Dutch Antilles and Suriname", 
        year: "<b>Year</b>: 1965+", 
        priceINR: 17500, 
        isSoldOut: true,
        folder: "FDC",
        imageCount: 23,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4059:3 Luxureous Importa albums in excellent condition with collection about 350 FDC covers Dutch Antilles and Suriname. \
        Check the photos to see a small part, but there is a lot more than you can see here.Three albums for FREE + shipping inside India in April 2026" 
    },
    { 
        name: "TinTin FDC and MS", 
        country: "Netherlands", 
        year: "<b>Year</b>: 1999", 
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
        year: "<b>Year</b>: various", 
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
        year: "<b>Year</b>: various", 
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
        year: "<b>Year</b>: 1973", 
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
        year: "<b>Year</b>: 1975", 
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
        year: "<b>Year</b>: 1974", 
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
        year: "<b>Year</b>: 1989", 
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
        year: "<b>Year</b>: 1989", 
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
        year: "<b>Year</b>: 1995", 
        priceINR: 270, 
        isSoldOut: false,
        folder: "006",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4065: MNH MS from India( Free letter post shipping worldwide from Netherlands)"
    }
];
