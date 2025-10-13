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
}