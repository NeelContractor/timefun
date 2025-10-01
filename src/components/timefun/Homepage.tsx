import Image from "next/image";
import { Button } from "../ui/button";
import CreatorCard from "./CreatorCard";
import CategorySelector from "./CategorySelector";
import HowItWorks from "./HowItWorks";

export default function Homepage() {
    return <div className="grid grid-cols-2">
        <div className="flex justify-center items-center">
            <div className="">
                <div className="grid justify-center gap-5">
                    <div className="flex gap-5">
                        <h1 className="text-elements-highem tracking-tight font-[Libre Franklin] text-5xl font-black leading-[48px] text-center md:text-left">TIME IS MONEY.</h1>
                        <div className="flex border-none rounded-4xl self-center bg-pink-900 p-2 font-bold">
                            <Image src={"/arrow.png"} alt="Up Arrow" height={25} width={25} />
                            36%
                        </div>
                    </div>
                    <p>Get instant access to and invest in your favorite creators & experts.</p>
                    <div className="flex  gap-5">
                        <Button     
                            className="bg-pink-300 hover:bg-pink-200 py-6 px-7 font-semibold text-lg"
                        >
                            Explore creators
                        </Button>
                        <Button
                            className="bg-[#1c1719] text-white hover:bg-[#1c17199c] py-6 px-7 font-semibold text-lg"
                        >
                            Get paid for your time
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex ">
            <CreatorCard />
        </div>

    </div>
}