import Image from "next/image";
import Homepage from "./Homepage";
import CategorySelector from "./CategorySelector";
import HowItWorks from "./HowItWorks";
import Appbar from "./Appbar";

export default function Timefun() {

    return (
        <div className="min-h-screen bg-black text-white">
            <Appbar />
            <Homepage />
            <CategorySelector />
            <HowItWorks />
        </div>
    );
    
    // return <div className="mx-10 my-5">
    //     <div className="flex justify-start">
    //         <Appbar />
    //         {/* <Image src={"/favicon.png"} alt="TimeFun" width={40} height={40} className="flex justify-center" /> */}
    //         {/* <h1 className="text-center font-extrabold text-4xl tracking-tighter font-[Passion One]">TIME.FUN</h1> */}
    //         <g clipPath="url(#clip0_6062_82)">
    //             <path d="M357.09 108.52C364.369 108.52 370.27 102.619 370.27 95.3401C370.27 88.061 364.369 82.1602 357.09 82.1602C349.811 82.1602 343.91 88.061 343.91 95.3401C343.91 102.619 349.811 108.52 357.09 108.52Z" fill="#FF9FC6"></path>
    //         </g>
    //     </div>
    //     <Homepage />
    //     <div className="flex">
    //         <CategorySelector />
    //     </div>
    //     <div className="flex">
    //         <HowItWorks />
    //     </div>
    // </div>
}