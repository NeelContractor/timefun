import { MessageCircle, Star, TrendingUp } from "lucide-react"
import Image from "next/image"

interface MockedCreatorsType {
    name: string
    description: string
    image: React.ReactElement<HTMLImageElement>
    price: number
    // rating: number
    // responseRate: number
}

const mockedCreators: MockedCreatorsType[] = [
    {
        name: "toly",
        description: "Co-Founder of Solana Labs. Award winning phone creator. NFA, don't trust me, mostly technical gibber",
        image: <Image src={"/tolyImage.webp"} alt="Image" width={220} height={200} />,
        price: 12.83,
        // rating: 5,
        // responseRate: 100
    },
    {
        name: "Kawz",
        description: "Founder @ Timefun // Time is the most valuable asset",
        image: <Image src={"/kawzImage.webp"} alt="Image" width={220} height={200} />,
        price: 3.77,
        // rating: 5,
        // responseRate: 100
    },
    {
        name: "Ansem",
        description: "coldest nigga breathing | @BullpenFi | telegram @blknoiz06 | ig @blknoiz_06 | all other clone accoun",
        image: <Image src={"/ansemImage.webp"} alt="Image" width={220} height={200} />,
        price: 9.81,
        // rating: 5,
        // responseRate: 100
    },
    {
        name: "raj",
        description: "@solana accelerationist",
        image: <Image src={"/rajImage.webp"} alt="Image" width={220} height={200} />,
        price: 1.69,
        // rating: 1,
        // responseRate: 100
    },
    {
        name: "santiago",
        description: "Founder @ Inversion",
        image: <Image src={"/santiagoImage.webp"} alt="Image" width={220} height={200} />,
        price: 0.20,
        // rating: 5,
        // responseRate: 61
    },
    {
        name: "TimWelch",
        description: "Tim Welch Blackbelt / UFC Coach / Podcaster",
        image: <Image src={"/timwelchImage.webp"} alt="Image" width={220} height={200} />,
        price: 0.19,
        // rating: 5,
        // responseRate: 85
    },
]

export default function CreatorCard() {
    return (
        <div className="grid grid-cols-2 gap-6 max-h-[600px] lg:max-h-[980px] overflow-hidden">
            {mockedCreators.map((creator) => (
                <div 
                    key={creator.name} 
                    className="group relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-950/10 to-purple-950/10 backdrop-blur-md hover:border-pink-500/50 transition-all duration-300 cursor-pointer"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                    <Card creator={creator} />
                </div>
            ))}
        </div>
    )
    // return <div className="grid grid-cols-2 h-[360px] gap-6 overflow-hidden md:h-[980px]">
    //     {mockedCreators.map((creator) => (
    //         <div key={creator.name} className="group overflow-hidden rounded-[22px] border border-white/[8%] bg-black/60 p-1.5 backdrop-blur-md md:rounded-[30px] md:p-[9px] lg:rounded-[40px] lg:p-3">
    //             <Card creator={creator} />
    //         </div>
    //     ))}
    // </div>
}

function Card({ creator }: { creator: MockedCreatorsType }) {
    return (
        <div className="relative h-[185px] w-full md:h-[248px] lg:h-[330px]">
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-2xl transition-opacity duration-300 h-full group-hover:opacity-0">
                {/* <Image 
                    src={creator.image} 
                    alt={creator.name} 
                    fill
                    className="object-cover"
                    /> */}
                    {creator.image} 
                {/* Gradient Overlay on Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Quick Info on Image */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white truncate">{creator.name}</h3>
                        {/* <div className="flex items-center gap-1 px-2 py-1 bg-pink-500/20 backdrop-blur-sm rounded-full border border-pink-500/30">
                            <Star className="w-3 h-3 text-pink-400 fill-pink-400" />
                            <span className="text-xs font-semibold text-white">{creator.rating}</span>
                        </div> */}
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-pink-400" />
                        <span className="text-lg font-bold text-pink-400">${creator.price}</span>
                        <span className="text-sm text-gray-300">/min</span>
                    </div>
                </div>
            </div>

            {/* Hover Content - Full Card Info */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 lg:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-pink-950/95 to-purple-950/95 backdrop-blur-sm">
                {/* Header */}
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-2xl font-bold text-white">{creator.name}</h3>
                        {/* <div className="flex items-center gap-1 px-3 py-1.5 bg-pink-500/30 backdrop-blur-sm rounded-full border border-pink-500/50 flex-shrink-0">
                            <Star className="w-4 h-4 text-pink-400 fill-pink-400" />
                            <span className="text-sm font-bold text-white">{creator.rating}</span>
                        </div> */}
                    </div>
                    
                    <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
                        {creator.description}
                    </p>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-black/30 rounded-lg border border-pink-500/20">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-pink-400" />
                            <span className="text-sm text-gray-300">Price</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-pink-400">${creator.price}</span>
                            <span className="text-xs text-gray-400">/min</span>
                        </div>
                    </div>

                    {/* <div className="flex items-center justify-between py-2 px-3 bg-black/30 rounded-lg border border-pink-500/20">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-pink-400" />
                            <span className="text-sm text-gray-300">Response Rate</span>
                        </div>
                        <span className="text-sm font-bold text-white">{creator.responseRate}%</span>
                    </div> */}

                    {/* CTA Button */}
                    <button className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-lg font-semibold text-white shadow-lg shadow-pink-500/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Connect Now
                    </button>
                </div>
            </div>
        </div>
    )
}