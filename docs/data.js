// 1. STAMP DATABASE
const stamps = [
    {
        name: "Stamps from around world (Used)",
        country: "Various Countries",
        year: "<b>Year</b>: 1920+",
        priceINR: 699,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D111",
        imageCount: 5,
        desc: "RN4180: Stamps from around world (Used). Check the photos. What you see is what you get."
    }, {
        name: "Germany 1993-2000 MNH stamp collection in 2 albums",
        country: "Germany",
        year: "<b>Year</b>: 1993-2000",
        priceINR: 14999,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D110",
        imageCount: 38,
        desc: "RN4179: 2 Safe dual albums Germany 1993-2000 with what looks like an (almost) complete MNH stamp collection with a lot of extra.Check the photos to see a small part, but there is a lot more than you can see here."
    },
    {
        name: "Europa CEPT 1956-1969 large stamp collection in album.",
        country: "Various Countries",
        year: "<b>Year</b>: 1956-1969",
        priceINR: 22499,
        isSoldOut: false,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D109",
        imageCount: 37,
        desc: "RN4178: Leuchtturm album Europa CEPT 1956-1969 with MNH as well as cancelled stamp collection, looking complete , some duplicates, extra sheets, etc. Check the photos to see a small part, but there is a lot more than you can see here."
    }, {
        name: "Mixed stamps from from the world on theme.",
        country: "Various Countries",
        year: "<b>Year</b>: 1960+",
        priceINR: 799,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D108",
        imageCount: 17,
        desc: "RN4177: Many stamps from around the world on theme. Check the photos. What you see is what you get."
    }, {
        name: "Mixed stamps from from the world on theme - Birds.",
        country: "Various Countries",
        year: "<b>Year</b>: 1960+",
        priceINR: 599,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D107",
        imageCount: 1,
        desc: "RN4176: 57 stamps from around the world on theme Birds. Check the photos. What you see is what you get."
    }, {
        name: "Mixed stamps from from the world on theme - Birds.",
        country: "Various Countries",
        year: "<b>Year</b>: 1960+",
        priceINR: 599,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D106",
        imageCount: 1,
        desc: "RN4175: 60 stamps from around the world on theme Birds. Check the photos. What you see is what you get."
    }, {
        name: "Mixed stamps from Old Germany used and MNH.",
        country: "Germany",
        year: "<b>Year</b>: 1960+",
        priceINR: 799,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D105",
        imageCount: 11,
        desc: "RN4174: Mixed stamps from Old Germany used and MNH. Check the photos. What you see is what you get."
    }, {
        name: "Dutch Antiles and Aruba lot 450 FDC covers",
        country: "Dutch Antiles and Aruba",
        year: "<b>Year</b>: 1990+",
        priceINR: 29250,
        isSoldOut: false,
        onSale: true,
        salePriceINR: 23999,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D104",
        imageCount: 6,
        desc: "RN4173: Box with collection about 450 FDC Netherlands Antilles incl. some Aruba. <b>Rs.65 per cover</b>\nCheck the photos to see a small part, but there is a lot more than you can see here."
    },
    {
        name: "Liechtenstein lot 700 FDC covers and maximumcaards",
        country: "Liechtenstein",
        year: "<b>Year</b>: 1990+",
        priceINR: 26000,
        isSoldOut: false,
        onSale: true,
        salePriceINR: 22999,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D103",
        imageCount: 6,
        desc: "RN4172: Lot Liechtenstein about 400 FDC and 300 maximumcards. <b>Rs.65 per cover</b>, Maximum cards all for Free\nCheck the photos to see a small part, but there is a lot more than you can see here."
    }, {
        name: "Collection of 360 Mint stamps from GB in Stockbook and old stamps.",
        country: "GB",
        year: "<b>Year</b>: 1900-2000",
        priceINR: 14400,
        isSoldOut: false,
        onSale: true,
        salePriceINR: 8999,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D102",
        imageCount: 24,
        desc: "RN4148: Collection of 360 Mint stamps from GB and old stamps.\
            <b>Rs.40 per stamp.</b>\
            Stock Album for free and Miniature sheets for free"
    },
    {
        name: "Classic collection from Romania",
        country: "Romania",
        year: "<b>Year</b>: 1920+",
        priceINR: 749,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D101",
        imageCount: 5,
        desc: "RN4171: Classic collection from Romania. Check the photos. What you see is what you get."
    },
    {
        name: "9 sets of Stamps from Great Britain (MNH) (38 stamps)",
        country: "Great Britain",
        year: "<b>Year</b>: 1960+",
        priceINR: 949,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D100",
        imageCount: 1,
        desc: "RN4170: 9 sets of Stamps from Great Britain (MNH) (38 stamps). Check the photos. What you see is what you get."
    }, {
        name: "11 sets of Stamps from Great Britain (MNH) (46 stamps)",
        country: "Great Britain",
        year: "<b>Year</b>: 1960+",
        priceINR: 1199,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D99",
        imageCount: 2,
        desc: "RN4169: 11 sets of Stamps from Great Britain (MNH) (46 stamps). Check the photos. What you see is what you get."
    }, {
        name: "75 Stamps from around world (MNH) on theme EUROPA CEPT",
        country: "Various Countries",
        year: "<b>Year</b>: 1960+",
        priceINR: 699,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D98",
        imageCount: 2,
        desc: "RN4168: 75 Stamps from around world (MNH) on theme EUROPA CEPT. Check the photos. What you see is what you get."
    },
    {
        name: "Stamps from around world (Used)",
        country: "Various Countries",
        year: "<b>Year</b>: 1960+",
        priceINR: 899,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D97",
        imageCount: 13,
        desc: "RN4167: Stamps from around world (Used). Check the photos. What you see is what you get."
    }, {
        name: "Stamps from around Europe (Used) (Italy, Belgium, Germany, Sweden)",
        country: "Various Countries",
        year: "<b>Year</b>: 1960+",
        priceINR: 699,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D96",
        imageCount: 6,
        desc: "RN4166: Stamps from around Europe (Used) (Italy, Belgium, Germany, Sweden). Check the photos. What you see is what you get."
    }, {
        name: "Stamps on theme : Satellite and communication",
        country: "Various Countries",
        year: "<b>Year</b>: 1960+",
        priceINR: 399,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D95",
        imageCount: 2,
        desc: "RN4165: Stamps on theme - Satellite and communication. Check the photos. What you see is what you get."
    },
    {
        name: "Stamps of Great Britian(used and MNH mix)",
        country: "Great Britian",
        year: "<b>Year</b>: 1900+",
        priceINR: 999,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D94",
        imageCount: 9,
        desc: "RN4164: Stamps from Great Britian(used and MNH mix). Check the photos. What you see is what you get."
    }, {
        name: "Stamps of Italy",
        country: "Italy",
        year: "<b>Year</b>: 1960+",
        priceINR: 799,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D93",
        imageCount: 5,
        desc: "RN4163: Stamps from Italy. Check the photos. What you see is what you get."
    },
    {
        name: "Birds/Animals stamps of various countries",
        country: "Various Countries",
        year: "<b>Year</b>: 1970+",
        priceINR: 599,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D92",
        imageCount: 4,
        desc: "RN4162: Stamps of various countries - Birds/Animals. Check the photo. What you see is what you get."
    }, {
        name: "Birds stamps of various countries",
        country: "Various Countries",
        year: "<b>Year</b>: 1970+",
        priceINR: 649,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D91",
        imageCount: 3,
        desc: "RN4161: Stamps of various countries - Birds. Check the photo. What you see is what you get."
    },
    {
        name: "German Empire postcards collection - D89",
        country: "German Empire",
        year: "<b>Year</b>: 1900+",
        priceINR: 500,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D89",
        imageCount: 2,
        desc: "RN4159: German Empire time period postcards. Check the photo. What you see is what you get."
    },
    {
        name: "German Empire postcards collection - D88",
        country: "German Empire",
        year: "<b>Year</b>: 1900+",
        priceINR: 500,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D88",
        imageCount: 2,
        desc: "RN4158: German Empire time period postcards. Check the photo. What you see is what you get."
    },
    {
        name: "German Empire postcards collection - D87",
        country: "German Empire",
        year: "<b>Year</b>: 1900+",
        priceINR: 500,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D87",
        imageCount: 2,
        desc: "RN4157: German Empire time period postcards. Check the photo. What you see is what you get."
    },
    {
        name: "German Empire postcards collection - D86",
        country: "German Empire",
        year: "<b>Year</b>: 1900+",
        priceINR: 500,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D86",
        imageCount: 2,
        desc: "RN4156: German Empire time period postcards. Check the photo. What you see is what you get."
    },
    {
        name: "German Empire postcards collection - D85",
        country: "German Empire",
        year: "<b>Year</b>: 1900+",
        priceINR: 500,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D85",
        imageCount: 2,
        desc: "RN4155: German Empire time period postcards. Check the photo. What you see is what you get."
    },
    {
        name: "German Empire postcards collection - D84",
        country: "German Empire",
        year: "<b>Year</b>: 1900+",
        priceINR: 500,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D84",
        imageCount: 2,
        desc: "RN4154: German Empire time period postcards. Check the photo. What you see is what you get."
    },
    {
        name: "German Empire postcards collection - D83",
        country: "German Empire",
        year: "<b>Year</b>: 1900+",
        priceINR: 500,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D83",
        imageCount: 2,
        desc: "RN4153: German Empire time period postcards. Check the photo. What you see is what you get."
    },
    {
        name: "German Empire postcards collection - D82",
        country: "German Empire",
        year: "<b>Year</b>: 1900+",
        priceINR: 500,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D82",
        imageCount: 2,
        desc: "RN4160: German Empire time period postcards. Check the photo. What you see is what you get."
    },
    {
        name: "German Reich set of 28 stamps",
        country: "German Reich",
        year: "<b>Year</b>:1941-1944",
        priceINR: 3080,
        onSale: true,
        salePriceINR: 2080,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D81",
        imageCount: 1,
        desc: "RN4152: German Reich set of 28 stamps\
                Check the photo. What you see is what you get.. "
    },
    {
        name: "France MNH stamp collection in stockbook",
        country: "France",
        year: "<b>Year</b>: Various",
        priceINR: 8800,
        isSoldOut: true,
        folder: "D80",
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        imageCount: 14,
        desc: "RN4151: Stockbook with MNH stamp collection France. Check the photos. What you see is what you get."
    }, {
        name: "Used stamps of Belgium",
        country: "Belgium",
        year: "<b>Year</b>: Various",
        priceINR: 900,
        onSale: true,
        salePriceINR: 800,
        isSoldOut: true,
        folder: "D79",
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        imageCount: 6,
        desc: "RN4150: Used stamps of Belgium.\n\nCheck the photos, what you see is what you get."
    }, {
        name: "Davo deluxe album Germany Reich 1872-1945",
        country: "German Reich",
        year: "<b>Year</b>: 1872-1945",
        priceINR: 40000,
        isSoldOut: true,
        folder: "D78",
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        imageCount: 51,
        desc: "RN4149: Davo deluxe album Germany (German Reich 1872-1945) in very good condition very well filled with cancelled stamp collection.\
            Check the photos to see a small part, but there is a lot more than you can see here."
    },
    {
        name: "Collection of 280 First Day Covers (FDC) from around Europe. GB, Finland, Norway, Portugal, Marshall Islands, etc",
        country: "World",
        year: "<b>Year</b>: 1975",
        priceINR: 18200,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D76",
        imageCount: 6,
        desc: "RN4147: Collection of 280 First Day Covers (FDC) from around Europe. GB, Finland, Norway, Portugal, Marshall Islands, etc\
            <b>Rs.65 per cover</b>\
            "
    }, {
        name: "Schaubek's Victoria Postage Stamp Album, which was a very popular German-made album during the late 19th",
        country: "World",
        year: "<b>Year</b>: 1890s",
        priceINR: 42000,
        isSoldOut: false,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D75",
        imageCount: 63,
        desc: "RN4146: Schaubek's  Victoria Postage Stamp Album, which was a very popular German-made album during the late 19th century.\
            Album has around 700 Hinged stamps.\
            Pictures are taken from all the pages.\
            <b>Rs.60 per stamp</b>\
            "
    }, {
        name: "Small box with about 350 FDC covers United Nations",
        country: "United Nations",
        year: "<b>Year</b>: 2026",
        priceINR: 21000,
        isSoldOut: false,
        onSale: true,
        salePriceINR: 17800,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D74",
        imageCount: 6,
        desc: "RN4145: Small box with about 350 FDC covers UN.\
            I am offering this box as it has arrived and hardly check them.\
            Check the photos to see a small part, but there is a lot more than you can see here.\
            <b>Rs.60 per cover</b>\
            "
    }, {
        name: "Postset Birds Saba",
        country: "Netherlands",
        year: "<b>Year</b>: 2026",
        priceINR: 900,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D73",
        imageCount: 4,
        desc: "RN4144: Postset Birds Saba.The rugged, green island of Saba teems with extraordinary birds.\
        <b>Muliple Sets available</b>\
        "
    }, {
        name: "Collection of 29 GB Postal History Covers (1940-1960s) - Registered, First Flight, High-Value Castles & Wildings",
        country: "Commonwealth",
        year: "<b>Year</b>: 1940-1960s",
        priceINR: 11600,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D72",
        imageCount: 29,
        desc: "RN4143: A diverse and high-quality collection of 29 British Postal History covers, spanning the late King George VI and early Queen Elizabeth II \"Wilding\" eras. \
        This lot is an excellent opportunity for a postal history specialist or a collector of international commercial mail.\
        <b>Rs.400 per cover.</b> \
        "
    }, {
        name: "Hyperinflation stamps from the definitive series of Weimar Republic",
        country: "Germany",
        year: "<b>Year</b>: 1923",
        priceINR: 899,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D71",
        imageCount: 1,
        desc: "RN4142: Fascinating piece of history from the Weimar Republic in Germany, specifically from the hyperinflation period of 1923.\
                "
    },
    {
        name: "Special issued Czechoslovakia album with collection about 180 mint hinged stamps",
        country: "Czechoslovakia",
        year: "<b>Year</b>: 1948+",
        priceINR: 7250,
        isSoldOut: true,
        folder: "D70",
        imageCount: 17,
        desc: "RN4141: Special issued Czechoslovakia album with collection about 180 mint hinged stamps.\
                Check the photos to see a small part, but there is a lot more than you can see here.\
                "
    },
    {
        name: "Large lot hundreds stamp sheets and some blocks, a lot topical",
        country: "World",
        year: "<b>Year</b>: Various",
        priceINR: 15000,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D69",
        imageCount: 11,
        desc: "RN4140: Large lot hundreds stamp sheets and some blocks, a lot mostly topical.\
                Check the photos. but there is a lot more than you can see here. \
                "
    },
    {
        name: "AIR Mail Covers travelled from around the world to West Germany",
        country: "West Germany",
        year: "<b>Year</b>: 1950-1990",
        priceINR: 15000,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D68",
        imageCount: 39,
        desc: "RN4139: 153 different AIR Mail Covers travelled from around the world to West Germany.\
                Check the photos. What you see is what you get.\
                <b>Rs.100 per cover </b> \
                "
    }, {
        name: "70 Years of Diplomatic Ties: Lao PDR & India Joint Postage Stamp Issue",
        country: "Lao PDR & India",
        year: "<b>Year</b>: 2026",
        priceINR: 1750,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "JointIssue",
        imageCount: 3,
        blogUrl: "blog/lao-india-joint-issue-2026.html",
        desc: "RN4138: Commemorating 70 years of friendship between Laos and India (1956-2026). \
        Features deep cultural ties including Buddhism and the Ramayana heritage. \
        Limited edition of 3,000 sets. (+ shipping inside India in April 2026)"
    },
    {
        name: "France stamp collection in stockbook",
        country: "France",
        year: "<b>Year</b>: 1850 onwards",
        priceINR: 9500,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D67",
        imageCount: 19,
        desc: "RN4137: Stockbook with stamp collection France.\
                Check the photos. What you see is what you get.<b> Stock Album for Free</b>\
                "
    },
    {
        name: "12 Reichspfennig stamp from the definitive series of Nazi Germany",
        country: "Germany",
        year: "<b>Year</b>: 1941",
        priceINR: 2000,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D66",
        imageCount: 3,
        desc: "RN4136: 12 Reichspfennig stamp from the definitive series of Nazi Germany. Sheet of 81 stamps\
                "
    },
    {
        name: "4 Reichspfennig stamp from the definitive series of Nazi Germany",
        country: "Germany",
        year: "<b>Year</b>: 1941",
        priceINR: 900,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D65",
        imageCount: 3,
        desc: "RN4135: 4 Reichspfennig stamp from the definitive series of Nazi Germany. Sheet of 72 stamps \
                "
    },
    {
        name: "3 Reichspfennig stamp from the definitive series of Nazi Germany",
        country: "Germany",
        year: "<b>Year</b>: 1941",
        priceINR: 1200,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D64",
        imageCount: 3,
        desc: "RN4134: 3 Reichspfennig stamp from the definitive series of Nazi Germany. Sheet of 90 stamps\
                <b> 5 copies available.</b> \
                "
    },
    {
        name: "The Dutch Water Defence Line",
        country: "Netherlands",
        year: "<b>Year</b>: 2026",
        priceINR: 1750,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D63",
        imageCount: 1,
        desc: "RN4133: On 30 March 2026, PostNL issued the Dutch Water Defence Line stamp sheetlet, which contains photos and plans of 19th- and early 20th-century \
            defences in the Netherlands. The Dutch Water Defence Lines is the collective name for the New Dutch Water Line and the Defence Line of Amsterdam. \
            By flooding land in war situations, these defense lines could protect the west of the Netherlands against the enemy.\
                <b> muliple copies available.</b> \
                "
    },
    {
        name: "Experience Nature - Butterflies Saba",
        country: "Netherlands",
        year: "<b>Year</b>: 2026",
        priceINR: 1750,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D62",
        imageCount: 1,
        desc: "RN4132: On 30 March 2026, PostNL issued Experience Nature - Butterflies Saba, a sheet with 10 stamps in 10 different designs\
                <b> muliple copies available.</b> \
                "
    },
    {
        name: "40 Years of André Buzin’s Birds – “From Pen to Brush”",
        country: "Belgium",
        year: "<b>Year</b>: 2025",
        priceINR: 1485,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "Buzin2025",
        imageCount: 1,
        desc: "RN4131: 40 Years of André Buzin’s Birds  'From Pen to Brush'\
                <b> 5 copies available.</b> \
                "
    },
    {
        name: "1 Reichspfennig stamp from the definitive series of Nazi Germany",
        country: "Germany",
        year: "<b>Year</b>: 1941",
        priceINR: 900,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D61",
        imageCount: 3,
        desc: "RN4130: 1 Reichspfennig stamp from the definitive series of Nazi Germany. Sheet of 90 stamps\
                <b> 5 copies available.</b> \
                "
    },
    {
        name: "Berlin 1955-1990 MNH stamp collection in album",
        country: "Germany",
        year: "<b>Year</b>: 1955-1990",
        priceINR: 11500,
        isSoldOut: true,
        folder: "D60",
        imageCount: 19,
        desc: "RN4129:Leuchtturm album Berlin 1955-1990 with from 1960 almost complete MNH stamp collection.\
                Check the photos to see a small part, but there is a lot more than you can see here.\
                <b> Album for FREE.</b> \
                "
    },
    {
        name: "MS OF Indian Masks Series 15 APRIL 1974",
        country: "India",
        year: "<b>Year</b>: 1974",
        priceINR: 1300,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D59",
        imageCount: 1,
        desc: "RN4128: MS OF Indian Masks Series 15 APRIL 1974.\
                <b> 3 copies available.</b> \
                "
    },
    {
        name: "Souvenir sheet from Netherlands 1994",
        country: "Netherlands",
        year: "<b>Year</b>:1994",
        priceINR: 150,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D58",
        imageCount: 1,
        desc: "RN4127: Souvenir sheet from Netherlands 1994.\
                "
    },
    {
        name: "Collection over 135 registered travelled covers from DDR Germany",
        country: "Germany",
        year: "<b>Year</b>:1960+",
        priceINR: 3375,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D57",
        imageCount: 2,
        desc: "RN4126: Collection over 135 registered travelled covers from DDR Germany.\
                Check the photos. What you see is what you get.\
                <b>Price: Rs.25/- per cover</b>\
                "
    },
    {
        name: "Collection over 130 registered travelled covers from DDR Germany",
        country: "Germany",
        year: "<b>Year</b>:1960+",
        priceINR: 3250,
        isSoldOut: false,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D56",
        imageCount: 2,
        desc: "RN4125: Collection over 130 registered travelled covers from DDR Germany.\
                Check the photos. What you see is what you get.\
                <b>Price: Rs.25/- per cover</b>\
                "
    },
    {
        name: "Collection over 205 FDC from DDR Germany",
        country: "Germany",
        year: "<b>Year</b>:1960+",
        priceINR: 8200,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D55",
        imageCount: 2,
        desc: "RN4124: Collection over 205 FDC from DDR Germany.\
                Check the photos. What you see is what you get.\
                <b>Price: Rs.40/- per cover</b>\
                "
    },
    {
        name: "World various postal item collection in stockbook, mostly older incl. Netherlands",
        country: "World",
        year: "<b>Year</b>:1890+",
        priceINR: 9000,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D54",
        imageCount: 16,
        desc: "RN4123: Collection over 100 covers and postal items various.\
                Check the photos. What you see is what you get.\
                <b>Price: Rs.90/- per cover</b>\
                "
    },
    {
        name: "32 FDC's from Deutsche Bundespost Berlin",
        country: "Germany",
        year: "<b>Year</b>:Various",
        priceINR: 1920,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D53",
        imageCount: 8,
        desc: "RN4122: 32 different FDC's from Deutsche Bundespost Berlin. Various thematics\
                <b>Price: Rs.60/- per cover</b>\
                "
    },
    {
        name: "Box with lot estimated over 750 FDC's",
        country: "International",
        year: "<b>Year</b>:Various",
        priceINR: 30000,
        isSoldOut: true,
        folder: "D52",
        imageCount: 11,
        desc: "RN4121: Check this lot estimated over 750 FDC's, \
                covers and postal items world including old. Nice treasure hunting for the coverlover.\
                Check the photos to see a small part, but there is a lot more than you can see here.\
                <b>Price: Rs.40/- per cover</b>\
                <b>Free Registered Shipping worldwide from Netherlands</b>. Can ship this immediately this week"
    },
    {
        name: "Box with about 450 stockcards with good stamp variation. A lot Europe and Congo",
        country: "International",
        year: "<b>Year</b>:Various",
        priceINR: 45000,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D51",
        imageCount: 26,
        desc: "RN4120: Box with about 450 stockcards with good stamp variation. A lot Europe and Congo, all ready to sell, only few duplicates.\
                Plus engros many duplicates blocks Spain and parts of sheets Uruguay.\
                The pictures of wholesale lots only show a small part. There is a lot more.\
                Total weight: 10 kg.\
                <b>Price: Rs.100/- per stock card.</b>"
    },
    {
        name: "International year of Child 1979 FDC's",
        country: "International",
        year: "<b>Year</b>: 1979+",
        priceINR: 3410,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D50",
        imageCount: 27,
        desc: "RN4116: Around 62 different FDC's on theme IYC 1979.\
            Check the photos. What you see is what you get.\
            <b>Rs.55/- per item.</b> \
            "
    },
    {
        name: "France collection mostly old postal items in binder",
        country: "France",
        year: "<b>Year</b>: 1900+",
        priceINR: 60000,
        isSoldOut: true,
        folder: "D49",
        imageCount: 40,
        desc: "RN4115: Binder with very nice collection about 300 mostly old postal items France, used and unused.\
            Check the photos. What you see is what you get.\
            <b>Rs.200/- per item.</b> Very unique and huge lot.\
             <b> Album for FREE</b>  "
    },
    {
        name: "Czechoslovakia sheetbinder with lot stamp blocks and sheets",
        country: "Czechoslovakia",
        year: "<b>Year</b>: 1930+",
        priceINR: 14500,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D48",
        imageCount: 27,
        desc: "RN4114: Lindner sheetbinder with lot blocks and some sheets Czechoslovakia.\
                Check the photos. What you see is what you get.\
             <b> Album for FREE</b>  "
    },
    {
        name: "France 1849-1983 stamp collection in album",
        country: "France",
        year: "<b>Year</b>: 1849-1983",
        priceINR: 10800,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D47",
        imageCount: 52,
        desc: "RN4113: Davo album France 1849-1983 with collection about 1350 stamps.\
            Check the photos to see a small part, but there is a lot more than you can see here.\
             <b> Davo Album for FREE</b>  "
    },
    {
        name: "Collection of 100 FDC's from Sweden",
        country: "Sweden",
        year: "<b>Year</b>: 1958+",
        priceINR: 3500,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D46",
        imageCount: 1,
        desc: "RN4112: Collection of 100 FDC's from Sweden. <b>Rs.35/- per cover</b>\
         "
    },
    {
        name: "Collection of old and modern used/MNH stamps from Different countries",
        country: "Suriname, Spain, Pakistan, Portugal",
        year: "<b>Year</b>: Various",
        priceINR: 899,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D45",
        imageCount: 6,
        desc: "RN4111: Collection of old and modern used/MNH stamps from Different countries,\
         Suriname, Spain, Pakistan, Portugal."
    },
    {
        name: "Collection of old and modern used/MNH stamps from France",
        country: "France",
        year: "<b>Year</b>: Various",
        priceINR: 899,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D44",
        imageCount: 8,
        desc: "RN4110: Collection of old and modern used/MNH stamps from France."
    },
    {
        name: "Definitive series from Belgian Congo",
        country: "Belgian Congo",
        year: "<b>Year</b>: 1960",
        priceINR: 720,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D43",
        imageCount: 1,
        desc: "RN4109: This collection features a colorful 1960 definitive series \
        from Belgian Congo depicting native flora, which was significantly modified \
        with a bold 'CONGO' overprint following the countrys independence that year. \
        These stamps are a perfect example of 'history in your hands'as they physically document \
        the immediate transition from a colonial territory to a sovereign nation."
    },
    {
        name: "Birds set from Suriname",
        country: "Suriname",
        year: "<b>Year</b>: 1980",
        priceINR: 360,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D42",
        imageCount: 1,
        desc: "RN4108: These are postage stamps from Suriname, a country in South America renowned for its \
            immense biodiversity, specifically featuring its vibrant native bird species. \
            This particular series is an airmail set (noted by the word 'luchtpost') issued in the early 1980s, \
            showcasing birds like the Red-billed Toucan and the Paradise Tanager."
    },
    {
        name: "Europa CEPT Great Britain",
        country: "Netherlands",
        year: "<b>Year</b>: 1960-61",
        priceINR: 360,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D41",
        imageCount: 1,
        desc: "RN4107:European Posts and Telecommunications (CEPT). Each features the portrait of Queen Elizabeth II \
                alongside symbolic designs like the 19 doves of 1961 or the stylized wheel of 1960, \
                representing European unity and communication.\
                <b>4 sets available</b>"
    },
    {
        name: "Roses set from Hungary",
        country: "Netherlands",
        year: "<b>Year</b>: 1962",
        priceINR: 350,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D40",
        imageCount: 1,
        desc: "RN4106:These are beautiful examples of Hungarian philately. You have a nearly complete set (7 out of 8) of the Roses series issued by Magyar Posta (Hungary's postal service) in 1962.\
                They are highly regarded by collectors for their striking black background aesthetic, which makes the botanical illustrations pop. All MNH."
    },
    {
        name: "Shoebox with a lot MNH stamps Netherlands.",
        country: "Netherlands",
        year: "<b>Year</b>: 1960+",
        priceINR: 10500,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D39",
        imageCount: 14,
        desc: "RN4104: Shoebox with a lot MNH stamps Netherlands, parts of sheets, etc.\
                Check the photos to see a small part, but there is a lot more than you can see here..\
                "
    },
    {
        name: "Buzin birds collection from Belgium.",
        country: "Belgium",
        year: "<b>Year</b>: 1980+",
        priceINR: 899,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D38",
        imageCount: 2,
        desc: "RN4103: MNH stamps from Belgium on theme birds.\
                Check the photos. What you see is what you get.",
        blogUrl: "blog/buzin.html" // Adding this triggers the icon
    },
    {
        name: "Classic German Reich and DDR used/MH stamp collection.",
        country: "German Reich",
        year: "<b>Year</b>: 1900+",
        priceINR: 12500,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D37",
        imageCount: 48,
        desc: "RN4102: Thick stockbook with classic German Reich and DDR used/MH stamp collection.\
                Check the photos. What you see is what you get.\
                <b>Album for free</b>"
    },
    {
        name: "Great-Britain and spaceship themed stamps.",
        country: "GB and others",
        year: "<b>Year</b>: Various",
        priceINR: 849,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D36",
        imageCount: 8,
        desc: "RN4101: Used stamps from Great-Britain and spaceship themed stamps.\
                Check the photos. What you see is what you get."
    }, {
        name: "Thick stockbook with stamp collection Italy. Old classic high CV.",
        country: "Italy",
        year: "<b>Year</b>: 1900+",
        priceINR: 8499,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D35",
        imageCount: 29,
        desc: "RN4100: Thick stockbook with stamp collection Italy.\
                Check the photos. What you see is what you get.\
                + Shipping inside India in April 2026, <b>Album for free</b>"
    },
    {
        name: "Thick stockbook with stamp collection Spain. Old classic high CV.",
        country: "Spain",
        year: "<b>Year</b>: 1900+",
        priceINR: 9999,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D34",
        imageCount: 29,
        desc: "RN4099: Thick stockbook with stamp collection Spain.\
                Check the photos. What you see is what you get.\
                <b>Album for free</b>"
    },
    {
        name: "Stockbook with stamp collection Australia.",
        country: "Australia",
        year: "<b>Year</b>: 1940+",
        priceINR: 6499,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D33",
        imageCount: 25,
        desc: "RN4098: Stockbook with stamp collection Australia.\
                Check the photos. What you see is what you get.\
                <b>Album for free</b>"
    },
    {
        name: "Several different definitive stamp sheets from India.",
        country: "India",
        year: "<b>Year</b>: 1980+",
        priceINR: 1615,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D32",
        imageCount: 5,
        desc: "RN4097: Several different definitive stamp sheets from India.\
                Check the photos. What you see is what you get."
    },
    {
        name: "World various stamp collection , Mostly used stamps",
        country: "Australia, Papa new Guinea",
        year: "<b>Year</b>: various",
        priceINR: 1099,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D31",
        imageCount: 8,
        desc: "RN4096: World various stamp collection , Mostly used stamps.\
                Check the photos. What you see is what you get."
    },
    {
        name: "World various stamp collection in stockbook, incl. Indonesia, Japan and China.",
        country: "Indonesia, Japan and China",
        year: "<b>Year</b>: various",
        priceINR: 9999,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D30",
        imageCount: 32,
        desc: "RN4095: World various stamp collection in stockbook, incl. Indonesia, Japan and China.\
                Check the photos. What you see is what you get.\
                <b>Thick album for free</b>"
    },
    {
        name: "Modern/Old used and MNH stamps from Great Britian",
        country: "Great Britain, Ireland",
        year: "<b>Year</b>: 1900+",
        priceINR: 1499,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D29",
        imageCount: 21,
        desc: "RN4094: Modern/Old used and MNH stamps from Great Britian.\
                Check the photo. What you see is what you get.. "
    },
    {
        name: "Modern/Old used stamps from Europe.",
        country: "Germany, Sweden",
        year: "<b>Year</b>: Various",
        priceINR: 799,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D28",
        imageCount: 7,
        desc: "RN4093: Modern/Old used stamps from Europe.\
                Check the photo. What you see is what you get.. "
    },
    {
        name: "Hungary 1871-1980 with collection about 2900 stamps",
        country: "Hungary",
        year: "<b>Year</b>:Old",
        priceINR: 14500,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D27",
        imageCount: 33,
        desc: "RN4092: 2 Albums Hungary 1871-1980 with collection about 2900 stamps.\
                Check the photos to see a small part, but there is a lot more than you can see here.\
                <b>Rs.5/- per stamp</b>\
            Check the photos. What you see is what you get.  <b> 2 Thick Album for FREE</b>"
    },
    {
        name: "2 Albums with collection over 340 FDC covers from Iceland",
        country: "Iceland",
        year: "<b>Year</b>:1964-1986",
        priceINR: 22100,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D26",
        imageCount: 65,
        desc: "RN4091: 2 Album with collection over 340 FDC covers Iceland 1964-1971, 1968-1986, various editions and colours.\
            Check the photos. What you see is what you get.  <b> Thick Album for FREE</b>"
    },
    {
        name: "Great Britain stamp collection in thick stockbook",
        country: "Great Britain",
        year: "<b>Year</b>:1890 onwards",
        priceINR: 7499,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D25",
        imageCount: 28,
        desc: "RN4090: Thick stockbook with stamp collection Great Britain.\
               Check the photos. What you see is what you get.  <b> Thick Album for FREE</b>"
    },
    {
        name: "Huge lot : Extensive mint and used/cancelled thematic Red Cross stamp collection 1917-1980.",
        country: "Worldwide",
        year: "<b>Year</b>:1917-1980",
        priceINR: 243000,
        isSoldOut: false,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D24",
        imageCount: 487,
        desc: "RN4089: Extensive mint and cancelled thematic stamp collection Red Cross 1917-1980, including covers and first-day covers, imperforate stamps, varieties, etc., in 8 albums. \
              High catalogue value!  <b> All 8 Albums for FREE</b>",
        blogUrl: "blog/redcross.html"
    },
    {
        name: "Europa CEPT 1956-2000",
        country: "Europa",
        year: "<b>Year</b>:1956-2000",
        priceINR: 98000,
        isSoldOut: false,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D23",
        imageCount: 363,
        blogUrl: "blog/europa_cept.html",
        desc: "RN4088: 99% complete, mint (year 1956 stamped) stamp collection Europa CEPT 1956-2000 in 3 Leuchtturm albums.. \
              High catalogue value!  <b> All 3 Albums for FREE</b>"
    },
    {
        name: "France Red Cross booklets 1952-2005",
        country: "France",
        year: "<b>Year</b>:1952-2005",
        priceINR: 109000,
        isSoldOut: false,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D22",
        imageCount: 73,
        desc: "RN4087: Beautiful collection of Red Cross stamp booklets from France 1952-2005 in 2 albums, \
              containing 1952 3x (2x mint, 1x cancelled), 1953 (mint and cancelled), 1954, 1955 (2x mint, 2x cancelled) etc. \
              High catalogue value! "
    },
    {
        name: "Very well filled, mainly used stamp collection India 1854-1993",
        country: "India",
        year: "<b>Year</b>:1854-1993",
        priceINR: 215200,
        isSoldOut: false,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D21",
        imageCount: 105,
        blogUrl: "blog/bharat.html",
        desc: "RN4086: Very well filled, mainly used stamp collection India 1854-1993, \
                including good stamps such as (Stanley Gibbons no's): 66, 119-147, 151-191, 247-264, 305-308 Gandhi), \
                service 72, 102, etc. in 2 blank albums with slipcases."
    },
    {
        name: "Old used stamps from Africa. Mix of MNH and used.(around 500 stamps)",
        country: "Mocambique, Tanzania, Guinea-Bissau, Zaire, SouthAfrica, Rwanda, Egypt,Cameroon, Algeria, Kenya",
        year: "<b>Year</b>:1920 onwards",
        priceINR: 999,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D20",
        imageCount: 16,
        desc: "RN4085: Old used stamps from Africa. Mix of MNH and used.(<b>around 500 stamps</b>)\
                Check the photo. What you see is what you get.. "
    },
    {
        name: "Old used stamps from Europe. Mix of MNH and used.(around 1000 stamps)",
        country: "Germany, German Empire, Indonesia, Poland, Austria",
        year: "<b>Year</b>:1930 onwards",
        priceINR: 1099,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D19",
        imageCount: 14,
        desc: "RN4084: Old used stamps from Europe. Mix of MNH and used.(<b>around 1000 stamps</b>)\
                Check the photo. What you see is what you get.. "
    },
    {
        name: "Germany and Berlin stamp collection in 3 albums",
        country: "Germany and Berlin",
        year: "<b>Year</b>:1956 onwards",
        priceINR: 11499,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D18",
        imageCount: 64,
        desc: "RN4083: 2 Davo and 1 Safe album Germany Bund and Berlin with a lot of stamps.\
                Check the photos to see a small part, but there is a lot more than you can see here\
                <b>All 3 Albums for free</b>"
    },
    {
        name: "Asia incl. MNH Bhutan stamp collection",
        country: "Bhutan, Kazakhstan",
        year: "<b>Year</b>:1980 onwards",
        priceINR: 1499,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D17",
        imageCount: 9,
        desc: "RN4082: Asia incl. MNH Bhutan stamp collection\
                Check the photo. What you see is what you get.. "
    },
    {
        name: "German Reich set of 27 stamps(few repeated)",
        country: "German Reich",
        year: "<b>Year</b>:1941-1944",
        priceINR: 899,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D16",
        imageCount: 1,
        desc: "RN4081: German Reich set of 27 stamps(few repeated)\
                Check the photo. What you see is what you get.. "
    },
    {
        name: "German Reich set of 22 stamps. (All Block of 2)",
        country: "German Reich",
        year: "<b>Year</b>:1942-1944",
        priceINR: 1199,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D15",
        imageCount: 1,
        desc: "RN4080: German Reich set of 22 stamps. (All Block of 2)\
                Check the photo. What you see is what you get.. "
    },
    {
        name: "France and territories stamp collection in stockbook",
        country: "France",
        year: "",
        priceINR: 7400,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
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
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D13",
        imageCount: 14,
        desc: "RN4078: Collection of used stamps from different eastern european countries.\
            Check the photos. What you see is what you get. ."
    },
    {
        name: "Germany Bayern postal item collection 2",
        country: "Germany Bayern",
        year: "<b>Year</b>: 1870-1900",
        priceINR: 9000,
        isSoldOut: true,
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
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
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
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
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
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D9",
        imageCount: 41,
        desc: "RN4074: Davo album Germany 1946-2003 with very well filled used stamp collection.\
                Check the photos to see a small part, but there is a lot more than you can see here.\
                Stock Album for free "
    },
    {
        name: "Around 550 FDC's from Netherlands",
        country: "Netherlands",
        year: "<b>Year</b>: 1965 - 1999",
        priceINR: 22000,
        isSoldOut: false,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "D8",
        imageCount: 3,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4073: Around 550 FDCs from Netherlands Each FDC is atleast with 2 stamps on it.. \
        many are with whole miniature sheets. \
        Price: <b>Rs.40</b> per FDC. \
        Total will be <b>Rs.22000</b>"
    },
    {
        name: "Complete set of 11 MS from India 2025",
        country: "India",
        year: "<b>Year</b>: 2025",
        priceINR: 2150,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
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
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D6",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4071:On March 31, 2025, PostNL will release Experience Nature - Butterflies of Sint Eustatius, \
        a sheet of 10 stamps in 10 different designs. "
    },
    {
        name: "Experience Nature - Birds Sint Eustatius",
        country: "Netherlands",
        year: "<b>Year</b>: 2025",
        priceINR: 1640,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D5",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4070:On January 2, 2025, PostNL will release Experience Nature - Birds Sint Eustatius, \
        a sheet of 10 stamps in 10 different designs. "
    },
    {
        name: "Silver stamp – Dutch motorcycle brands – Eysink 1953",
        country: "Netherlands",
        year: "<b>Year</b>: 2025",
        priceINR: 2770,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D4",
        imageCount: 2,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4069:Designer Frank Janse is commemorating this Dutch motorcycle classic with a silver stamp, \
        presented in a luxurious mat. "
    },
    {
        name: "The Bull stamp sheet",
        country: "Netherlands",
        year: "<b>Year</b>: 2026",
        priceINR: 770,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D3",
        imageCount: 6,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4066: On January 15, 2026, PostNL will issue the The Bull stamp sheet featuring \
        the eponymous painting by Paulus Potter. "
    },
    {
        name: "Experience nature - birds Saba",
        country: "Netherlands",
        year: "<b>Year</b>: 2026",
        priceINR: 1640,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D2",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4067: On January 5, 2026, PostNL will release Experience Nature - Birds of Saba, \
        a sheet of 10 stamps in 10 different designs. "
    },
    {
        name: "New Dutch Design – Terugkerende Herinneringen (Returning Memories)",
        country: "Netherlands",
        year: "<b>Year</b>: 2026",
        priceINR: 990,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "D1",
        imageCount: 3,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4068: On February 16, 2026, PostNL will issue the New Dutch Design – Terugkerende Herinneringen \
        (Returning Memories) stamps, the first sheet of this year's New Dutch Design series."
    },
    {
        name: "Bundle - Crypto Stamp Heroes of Mythology",
        country: "Portugal, Austria, Luxembourg, Belgium, Netherlands",
        year: "<b>Year</b>: 2025",
        priceINR: 9999,
        isSoldOut: true,
        folder: "crypto",
        imageCount: 1,
        blogUrl: "blog/crypto.html", // Adding this triggers the icon
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4002: Bundle - Crypto Stamp Heroes of Mythology Portugal, Austria Post, Post Luxembourg, \
        bpost (Belgium) and PostNL (Netherlands)"
    },
    {
        name: "World stamps",
        country: "worldwide",
        year: "<b>Year</b>: 1970 onwards",
        priceINR: 8999,
        isSoldOut: true,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "world-stamps",
        imageCount: 31,
        //images: ["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=2"],
        desc: "RN4057: Thick stockbook with stamp collection various.Check the photos. \
        What you see is what you get. Thick album for free"
    },
    {
        name: "350 different Dutch Antilles and Suriname FDC's",
        country: "Dutch Antilles and Suriname",
        year: "<b>Year</b>: 1965+",
        priceINR: 17500,
        isSoldOut: true,
        freeTrackedShipping: true,
        freeLetterPostShipping: false,
        folder: "FDC",
        imageCount: 23,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "RN4059:3 Luxureous Importa albums in excellent condition with collection about 350 FDC covers Dutch Antilles and Suriname. \
        Check the photos to see a small part, but there is a lot more than you can see here.Three albums for FREE "
    },
    {
        name: "TinTin FDC and MS",
        country: "Netherlands",
        year: "<b>Year</b>: 1999",
        priceINR: 899,
        isSoldOut: false,
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        folder: "RN4043",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        freeLetterPostShipping: true,
        desc: "RN4043: FDC and miniature sheet from Netherlands."
    },
    {
        name: "60 FDC's from Switzerland",
        country: "Switzerland",
        year: "<b>Year</b>: various",
        priceINR: 3000,
        isSoldOut: true,
        folder: "RN4051",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        desc: "RN4051: 60 different FDC from Switzerland."
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
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
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
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        desc: "RN4060: MNH MS from India"
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
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        desc: "RN4062: MNH MS from India"
    },
    {
        name: "India 89' world philatelic exhibition",
        country: "India",
        year: "<b>Year</b>: 1989",
        priceINR: 270,
        isSoldOut: true,
        folder: "004",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        desc: "RN4063: MNH MS from India"
    },
    {
        name: "India 89' world philatelic exhibition MS2",
        country: "India",
        year: "<b>Year</b>: 1989",
        priceINR: 270,
        isSoldOut: true,
        folder: "005",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        desc: "RN4064: MNH MS from India"
    },
    {
        name: "Mahatma Gandhi South Africa joint issue",
        country: "India",
        year: "<b>Year</b>: 1995",
        priceINR: 270,
        isSoldOut: true,
        folder: "006",
        imageCount: 1,
        //images: ["https://picsum.photos/400/300?random=3"],
        freeTrackedShipping: false,
        freeLetterPostShipping: true,
        desc: "RN4065: MNH MS from India"
    }
];
