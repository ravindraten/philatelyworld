// 1. STAMP DATABASE
const stamps = [
    { 
        name: "Modern/Old used and MNH stamps from Great Britian", 
        country: "Great Britain, Ireland", 
        year: "<b>Year</b>: 1900+", 
        priceINR: 1499,
        isSoldOut: false,
        folder: "D29",
        imageCount: 17,
        desc: "RN4094: Modern/Old used and MNH stamps from Great Britian.\
                Check the photo. What you see is what you get.. \
                + Free letter post shipping from Netherlands in FDC"
    },
    { 
        name: "Modern/Old used stamps from Europe.", 
        country: "Germany, Sweden", 
        year: "<b>Year</b>: Various", 
        priceINR: 799,
        isSoldOut: false,
        folder: "D28",
        imageCount: 7,
        desc: "RN4093: Modern/Old used stamps from Europe.\
                Check the photo. What you see is what you get.. \
                + Free letter post shipping from Netherlands in FDC"
    },
    { 
        name: "Hungary 1871-1980 with collection about 2900 stamps", 
        country: "Hungary", 
        year: "<b>Year</b>:Old", 
        priceINR: 14500,
        isSoldOut: false,
        folder: "D27",
        imageCount: 33,
        desc: "RN4092: 2 Albums Hungary 1871-1980 with collection about 2900 stamps.\
                Check the photos to see a small part, but there is a lot more than you can see here.\
                <b>Rs.5/- per stamp</b>\
            Check the photos. What you see is what you get. + shipping inside India in April 2026. <b> 2 Thick Album for FREE</b>"
    },
    { 
        name: "2 Albums with collection over 340 FDC covers from Iceland", 
        country: "Iceland", 
        year: "<b>Year</b>:1964-1986", 
        priceINR: 22100,
        isSoldOut: true,
        folder: "D26",
        imageCount: 65,
        desc: "RN4091: 2 Album with collection over 340 FDC covers Iceland 1964-1971, 1968-1986, various editions and colours.\
            Check the photos. What you see is what you get. + shipping inside India in April 2026. <b> Thick Album for FREE</b>"
    },
    { 
        name: "Great Britain stamp collection in thick stockbook", 
        country: "Great Britain", 
        year: "<b>Year</b>:1890 onwards", 
        priceINR: 7499,
        isSoldOut: true,
        folder: "D25",
        imageCount: 28,
        desc: "RN4090: Thick stockbook with stamp collection Great Britain.\
               Check the photos. What you see is what you get. + shipping inside India in April 2026. <b> Thick Album for FREE</b>"
    },
    { 
        name: "Huge lot : Extensive mint and used/cancelled thematic Red Cross stamp collection 1917-1980.", 
        country: "Worldwide", 
        year: "<b>Year</b>:1917-1980", 
        priceINR: 243000,
        isSoldOut: false,
        folder: "D24",
        imageCount: 487,
        desc: "RN4089: Extensive mint and cancelled thematic stamp collection Red Cross 1917-1980, including covers and first-day covers, imperforate stamps, varieties, etc., in 8 albums. \
              High catalogue value! + shipping inside India in April 2026. <b> All 8 Albums for FREE</b>"
    },
    { 
        name: "Europa CEPT 1956-2000", 
        country: "Europa", 
        year: "<b>Year</b>:1956-2000", 
        priceINR: 98000,
        isSoldOut: false,
        folder: "D23",
        imageCount: 363,
        desc: "RN4088: 99% complete, mint (year 1956 stamped) stamp collection Europa CEPT 1956-2000 in 3 Leuchtturm albums.. \
              High catalogue value! + shipping inside India in April 2026. <b> All 3 Albums for FREE</b>"
    },
    { 
        name: "France Red Cross booklets 1952-2005", 
        country: "France", 
        year: "<b>Year</b>:1952-2005", 
        priceINR: 109000,
        isSoldOut: false,
        folder: "D22",
        imageCount: 73,
        desc: "RN4087: Beautiful collection of Red Cross stamp booklets from France 1952-2005 in 2 albums, \
              containing 1952 3x (2x mint, 1x cancelled), 1953 (mint and cancelled), 1954, 1955 (2x mint, 2x cancelled) etc. \
              High catalogue value! + shipping inside India in April 2026"
    },
    { 
        name: "Very well filled, mainly used stamp collection India 1854-1993", 
        country: "India", 
        year: "<b>Year</b>:1854-1993", 
        priceINR: 215200,
        isSoldOut: false,
        folder: "D21",
        imageCount: 105,
        desc: "RN4086: Very well filled, mainly used stamp collection India 1854-1993, \
                including good stamps such as (Stanley Gibbons no's): 66, 119-147, 151-191, 247-264, 305-308 Gandhi), \
                service 72, 102, etc. in 2 blank albums with slipcases.\
                + shipping inside India in April 2026"
    },
    { 
        name: "Old used stamps from Africa. Mix of MNH and used.(around 500 stamps)", 
        country: "Mocambique, Tanzania, Guinea-Bissau, Zaire, SouthAfrica, Rwanda, Egypt,Cameroon, Algeria, Kenya", 
        year: "<b>Year</b>:1920 onwards", 
        priceINR: 999,
        isSoldOut: true,
        folder: "D20",
        imageCount: 16,
        desc: "RN4085: Old used stamps from Africa. Mix of MNH and used.(<b>around 500 stamps</b>)\
                Check the photo. What you see is what you get.. \
                + Free letter post shipping from Netherlands in FDC"
    },
    { 
        name: "Old used stamps from Europe. Mix of MNH and used.(around 1000 stamps)", 
        country: "Germany, German Empire, Indonesia, Poland, Austria", 
        year: "<b>Year</b>:1930 onwards", 
        priceINR: 1099,
        isSoldOut: true,
        folder: "D19",
        imageCount: 14,
        desc: "RN4084: Old used stamps from Europe. Mix of MNH and used.(<b>around 1000 stamps</b>)\
                Check the photo. What you see is what you get.. \
                + Free letter post shipping from Netherlands in FDC"
    },
    { 
        name: "Germany and Berlin stamp collection in 3 albums", 
        country: "Germany and Berlin", 
        year: "<b>Year</b>:1956 onwards", 
        priceINR: 11499,
        isSoldOut: false,
        folder: "D18",
        imageCount: 64,
        desc: "RN4083: 2 Davo and 1 Safe album Germany Bund and Berlin with a lot of stamps.\
                Check the photos to see a small part, but there is a lot more than you can see here\
                <b>All 3 Albums for free</b>\
                + shipping inside India in April 2026"
    },
    { 
        name: "Asia incl. MNH Bhutan stamp collection", 
        country: "Bhutan, Kazakhstan", 
        year: "<b>Year</b>:1980 onwards", 
        priceINR: 1499,
        isSoldOut: false,
        folder: "D17",
        imageCount: 9,
        desc: "RN4082: Asia incl. MNH Bhutan stamp collection\
                Check the photo. What you see is what you get.. \
                + Free letter post shipping from Netherlands in FDC"
    },
    { 
        name: "German Reich set of 27 stamps(few repeated)", 
        country: "German Reich", 
        year: "<b>Year</b>:1941-1944", 
        priceINR: 899,
        isSoldOut: false,
        folder: "D16",
        imageCount: 1,
        desc: "RN4081: German Reich set of 27 stamps(few repeated)\
                Check the photo. What you see is what you get.. \
                + Free letter post shipping from Netherlands in FDC"
    },
    { 
        name: "German Reich set of 22 stamps. (All Block of 2)", 
        country: "German Reich", 
        year: "<b>Year</b>:1942-1944", 
        priceINR: 1199,
        isSoldOut: false,
        folder: "D15",
        imageCount: 1,
        desc: "RN4080: German Reich set of 22 stamps. (All Block of 2)\
                Check the photo. What you see is what you get.. \
                + Free letter post shipping from Netherlands in FDC"
    },
    { 
        name: "France and territories stamp collection in stockbook", 
        country: "France", 
        year: "", 
        priceINR: 7400,
        isSoldOut: true,
        folder: "D14",
        imageCount: 19,
        desc: "RN4079: Stockbook with stamp collection France and territories\
                Check the photos. What you see is what you get.. <b>Stock Album for free</b>\
                + shipping inside India in April 2026"
    },
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
        isSoldOut: true,
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
        isSoldOut: true,
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
