import Image from "next/image"

interface MockedCreatorsType {
    name: string
    description: string
    image: React.ReactElement<HTMLImageElement>
    price: number
    rating: number
    responseRate: number
}

const mockedCreators: MockedCreatorsType[] = [
    {
        name: "toly",
        description: "Co-Founder of Solana Labs. Award winning phone creator. NFA, don't trust me, mostly technical gibber",
        image: <Image src={"/tolyImage.webp"} alt="Image" width={200} height={200} />,
        price: 12.83,
        rating: 5,
        responseRate: 100
    },
    {
        name: "Kawz",
        description: "Founder @ Timefun // Time is the most valuable asset",
        image: <Image src={"/kawzImage.webp"} alt="Image" width={200} height={200} />,
        price: 3.77,
        rating: 5,
        responseRate: 100
    },
    {
        name: "Ansem",
        description: "coldest nigga breathing | @BullpenFi | telegram @blknoiz06 | ig @blknoiz_06 | all other clone accoun",
        image: <Image src={"/ansemImage.webp"} alt="Image" width={200} height={200} />,
        price: 9.81,
        rating: 5,
        responseRate: 100
    },
    {
        name: "raj",
        description: "@solana accelerationist",
        image: <Image src={"/rajImage.webp"} alt="Image" width={200} height={200} />,
        price: 1.69,
        rating: 1,
        responseRate: 100
    },
    {
        name: "santiago",
        description: "Founder @ Inversion",
        image: <Image src={"/santiagoImage.webp"} alt="Image" width={200} height={200} />,
        price: 0.20,
        rating: 5,
        responseRate: 61
    },
    {
        name: "TimWelch",
        description: "Tim Welch Blackbelt / UFC Coach / Podcaster",
        image: <Image src={"/timwelchImage.webp"} alt="Image" width={200} height={200} />,
        price: 0.19,
        rating: 5,
        responseRate: 85
    },
]

export default function CreatorCard() {
    return <div className="grid grid-cols-2 h-[360px] gap-6 overflow-hidden md:h-[680px]">
        {mockedCreators.map((creator) => (
            <div key={creator.name} className="group overflow-hidden rounded-[22px] border border-white/[8%] bg-black/60 p-1.5 backdrop-blur-md md:rounded-[30px] md:p-[9px] lg:rounded-[40px] lg:p-3">
                <Card creator={creator} />
            </div>
        ))}
    </div>
}

function Card({ creator }: { creator: MockedCreatorsType }) {
    return <div className="relative h-[185px] w-[140px] md:h-[248px] md:w-[186px] lg:h-[330px] lg:w-[248px]">
        <div className="relative overflow-hidden rounded-2xl transition-opacity duration-100 md:rounded-[21px] lg:rounded-[28px] lg:group-hover:opacity-0">
            {creator.image}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-[66px] flex-col overflow-hidden px-1.5 py-1.5 transition-[height] duration-100 ease-out md:h-[88px] md:px-[9px] md:py-[9px] lg:h-[120px] lg:px-3 lg:py-3 lg:group-hover:h-full lg:group-hover:justify-between lg:group-hover:py-5">
            <div className="text-xl font-bold">
                {creator.name}
            </div>
            <div>
                ${creator.price} /min
            </div>
        </div>
        <div className="text-gray-400 line-clamp-3">
            {creator.description}
        </div>
    </div>
}