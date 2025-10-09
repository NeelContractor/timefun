"use client"
import { ReactNode, useState } from 'react';
import { CarouselNext, CarouselPrevious, Carousel, CarouselApi, CarouselContent, CarouselItem } from '../ui/carousel';
import { Card, CardContent } from '../ui/card';
import { useTimeFunProgram } from './timefun-data-access';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

type CategoryType = "all" | "topCreators" | "founders" | "influencers" | "investors" | "designer" | "athletes" | "solana" | "musicians" | "media" | "timeFunTeam" | "companies" | "other";

// const categoryOptions = [
//   { key: 'all', label: 'Top Creator'},
//   { key: 'timeFunTeam', label: 'TimeFunTeam'},
//   { key: 'founders', label: 'Founders'},
//   { key: 'influencers', label: 'Influencers'},
//   { key: 'investors', label: 'Investors'},
//   { key: 'designer', label: 'Designer'},
//   { key: 'athletes', label: 'Athletes'},
//   { key: 'solana', label: 'Solana'},
//   { key: 'musicians', label: 'Musicians'},
//   { key: 'media', label: 'Media'},
//   { key: 'companies', label: 'Companies'},
//   { key: 'other', label: 'Other'}
// ];

const getCategoryType = (category: any) => {
  const typeKey = Object.keys(category)[0];
  
  switch (typeKey) {
    case 'all': return "all";
    case 'timeFunTeam': return "timeFunTeam";
    case 'founders': return "founders";
    case 'influencers': return "influencers";
    case 'investors': return "investors";
    case 'designer': return "designer";
    case 'athletes': return "athletes";
    case 'solana': return "solana";
    case 'musicians': return "musicians";
    case 'media': return "media";
    case 'other': return "other";
    default: return "all";
  }
};

interface CategoryTab {
  id: CategoryType;
  name: string;
  icon: ReactNode;
}

const categoryTabs = [
    {id: "all", name: "All Creators", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M112,80A32,32,0,1,1,80,48,32,32,0,0,1,112,80Zm64,32a32,32,0,1,0-32-32A32,32,0,0,0,176,112ZM80,144a32,32,0,1,0,32,32A32,32,0,0,0,80,144Zm96,0a32,32,0,1,0,32,32A32,32,0,0,0,176,144Z" opacity="0.2"></path><path d="M80,40a40,40,0,1,0,40,40A40,40,0,0,0,80,40Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,80,104Zm96,16a40,40,0,1,0-40-40A40,40,0,0,0,176,120Zm0-64a24,24,0,1,1-24,24A24,24,0,0,1,176,56ZM80,136a40,40,0,1,0,40,40A40,40,0,0,0,80,136Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,80,200Zm96-64a40,40,0,1,0,40,40A40,40,0,0,0,176,136Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,176,200Z"></path></svg>}, 
    {id: "topCreators", name: "Top Creators", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M208,144a80,80,0,0,1-160,0c0-30.57,14.42-58.26,31-80l33,32,26.27-72C159.86,41.92,208,88.15,208,144Z" opacity="0.2"></path><path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z"></path></svg>}, 
    {id: "founders", name: "Founders", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M136,32V216H40V85.35a8,8,0,0,1,3.56-6.66l80-53.33A8,8,0,0,1,136,32Z" opacity="0.2"></path><path d="M240,208H224V96a16,16,0,0,0-16-16H144V32a16,16,0,0,0-24.88-13.32L39.12,72A16,16,0,0,0,32,85.34V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM208,96V208H144V96ZM48,85.34,128,32V208H48ZM112,112v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm-32,0v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm0,56v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm32,0v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Z"></path></svg>},
    {id: "influencers", name: "Influencers", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M230.08,78.26l-31.84,26.88L208,145.33a5.46,5.46,0,0,1-8.19,5.86L164,129.66l-35.78,21.53a5.46,5.46,0,0,1-8.19-5.86l9.73-40.19L97.92,78.26a5.38,5.38,0,0,1,3.13-9.48l41.79-3.31,16.1-38.14a5.51,5.51,0,0,1,10.12,0l16.1,38.14L227,68.78A5.38,5.38,0,0,1,230.08,78.26Z" opacity="0.2"></path><path d="M239.35,70.08a13.41,13.41,0,0,0-11.77-9.28l-36.94-2.92L176.43,24.22a13.51,13.51,0,0,0-24.86,0L137.36,57.88,100.42,60.8a13.39,13.39,0,0,0-7.66,23.58l28.06,23.68-8.56,35.39a13.32,13.32,0,0,0,5.1,13.91,13.51,13.51,0,0,0,15,.69L164,139l31.65,19.06a13.54,13.54,0,0,0,15-.69,13.34,13.34,0,0,0,5.09-13.91l-8.56-35.39,28.06-23.68A13.32,13.32,0,0,0,239.35,70.08ZM193.08,99a8,8,0,0,0-2.61,8l8.28,34.21L168.13,122.8a8,8,0,0,0-8.25,0l-30.62,18.43L137.54,107a8,8,0,0,0-2.62-8L108,76.26l35.52-2.81a8,8,0,0,0,6.74-4.87L164,35.91l13.79,32.67a8,8,0,0,0,6.74,4.87l35.53,2.81Zm-105,24.18L29.66,181.66a8,8,0,0,1-11.32-11.32l58.45-58.45a8,8,0,0,1,11.32,11.32Zm10.81,49.87a8,8,0,0,1,0,11.31L45.66,237.66a8,8,0,0,1-11.32-11.32l53.27-53.26A8,8,0,0,1,98.92,173.08Zm73-1a8,8,0,0,1,0,11.32l-54.28,54.28a8,8,0,0,1-11.32-11.32l54.29-54.28A8,8,0,0,1,171.94,172.06Z"></path></svg>},
    {id: "investors", name: "Investors", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M16,152H48v56H16a8,8,0,0,1-8-8V160A8,8,0,0,1,16,152ZM204,56a28,28,0,0,0-12,2.71h0A28,28,0,1,0,176,85.29h0A28,28,0,1,0,204,56Z" opacity="0.2"></path><path d="M230.33,141.06a24.43,24.43,0,0,0-21.24-4.23l-41.84,9.62A28,28,0,0,0,140,112H89.94a31.82,31.82,0,0,0-22.63,9.37L44.69,144H16A16,16,0,0,0,0,160v40a16,16,0,0,0,16,16H120a7.93,7.93,0,0,0,1.94-.24l64-16a6.94,6.94,0,0,0,1.19-.4L226,182.82l.44-.2a24.6,24.6,0,0,0,3.93-41.56ZM16,160H40v40H16Zm203.43,8.21-38,16.18L119,200H56V155.31l22.63-22.62A15.86,15.86,0,0,1,89.94,128H140a12,12,0,0,1,0,24H112a8,8,0,0,0,0,16h32a8.32,8.32,0,0,0,1.79-.2l67-15.41.31-.08a8.6,8.6,0,0,1,6.3,15.9ZM164,96a36,36,0,0,0,5.9-.48,36,36,0,1,0,28.22-47A36,36,0,1,0,164,96Zm60-12a20,20,0,1,1-20-20A20,20,0,0,1,224,84ZM164,40a20,20,0,0,1,19.25,14.61,36,36,0,0,0-15,24.93A20.42,20.42,0,0,1,164,80a20,20,0,0,1,0-40Z"></path></svg>},
    {id: "designer", name: "Designer", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M104,104V208H40a8,8,0,0,1-8-8V104Z" opacity="0.2"></path><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V96H40V56ZM40,112H96v88H40Zm176,88H112V112H216v88Z"></path></svg>},
    {id: "athletes", name: "Athletes", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M176,56a24,24,0,1,1-24-24A24,24,0,0,1,176,56Z" opacity="0.2"></path><path d="M152,88a32,32,0,1,0-32-32A32,32,0,0,0,152,88Zm0-48a16,16,0,1,1-16,16A16,16,0,0,1,152,40Zm67.31,100.68c-.61.28-7.49,3.28-19.67,3.28-13.85,0-34.55-3.88-60.69-20a169.31,169.31,0,0,1-15.41,32.34,104.29,104.29,0,0,1,31.31,15.81C173.92,186.65,184,207.35,184,232a8,8,0,0,1-16,0c0-41.7-34.69-56.71-54.14-61.85-.55.7-1.12,1.41-1.69,2.1-19.64,23.8-44.25,36.18-71.63,36.18A92.29,92.29,0,0,1,31.2,208,8,8,0,0,1,32.8,192c25.92,2.59,48.47-7.49,67-30,12.49-15.14,21-33.61,25.25-47C86.13,92.34,61.27,111.63,61,111.84A8,8,0,1,1,51,99.36c1.5-1.2,37.22-29,89.51,6.57,45.47,30.91,71.93,20.31,72.18,20.19a8,8,0,1,1,6.63,14.56Z"></path></svg>},
    {id: "solana", name: "Solana", icon: <svg viewBox="0 0 36 36" width="36" height="36" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="size-6 fill-elements-midem"><g><path d="M3.9 14.355a.785.785 0 0 1 .554-.23h19.153c.35 0 .525.423.277.67l-3.783 3.784a.785.785 0 0 1-.555.23H.393a.392.392 0 0 1-.277-.67l3.783-3.784z" transform="translate(6 9)"></path><path d="M3.9.23c.15-.146.35-.23.554-.23h19.153c.35 0 .525.422.277.67l-3.783 3.783a.785.785 0 0 1-.555.23H.393a.392.392 0 0 1-.277-.67L3.899.229z" transform="translate(6 9)"></path><path d="M20.1 7.247a.785.785 0 0 0-.554-.23H.393a.392.392 0 0 0-.277.67l3.783 3.784c.145.145.344.23.555.23h19.153c.35 0 .525-.423.277-.67l-3.783-3.784z" transform="translate(6 9)"></path></g></svg>},
    {id: "musicians", name: "Musicians", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M156.5,151,59,222.45a8,8,0,0,1-10.38-.79l-14.3-14.3A8,8,0,0,1,33.55,197L105,99.5l0,0A64,64,0,0,0,156.48,151Z" opacity="0.2"></path><path d="M168,16A72.07,72.07,0,0,0,96,88a73.29,73.29,0,0,0,.63,9.42L27.12,192.22A15.93,15.93,0,0,0,28.71,213L43,227.29a15.93,15.93,0,0,0,20.78,1.59l94.81-69.53A73.29,73.29,0,0,0,168,160a72,72,0,1,0,0-144Zm56,72a55.72,55.72,0,0,1-11.16,33.52L134.49,43.16A56,56,0,0,1,224,88ZM54.32,216,40,201.68,102.14,117A72.37,72.37,0,0,0,139,153.86ZM112,88a55.67,55.67,0,0,1,11.16-33.51l78.34,78.34A56,56,0,0,1,112,88Zm-2.35,58.34a8,8,0,0,1,0,11.31l-8,8a8,8,0,1,1-11.31-11.31l8-8A8,8,0,0,1,109.67,146.33Z"></path></svg>},
    {id: "media", name: "Media & Marketing", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M112,80A32,32,0,1,1,80,48,32,32,0,0,1,112,80Zm64,32a32,32,0,1,0-32-32A32,32,0,0,0,176,112ZM80,144a32,32,0,1,0,32,32A32,32,0,0,0,80,144Zm96,0a32,32,0,1,0,32,32A32,32,0,0,0,176,144Z" opacity="0.2"></path><path d="M80,40a40,40,0,1,0,40,40A40,40,0,0,0,80,40Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,80,104Zm96,16a40,40,0,1,0-40-40A40,40,0,0,0,176,120Zm0-64a24,24,0,1,1-24,24A24,24,0,0,1,176,56ZM80,136a40,40,0,1,0,40,40A40,40,0,0,0,80,136Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,80,200Zm96-64a40,40,0,1,0,40,40A40,40,0,0,0,176,136Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,176,200Z"></path></svg>},
    {id: "timeFunTeam", name: "TimeFun Team", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M205.64,53.66,128,128,50.36,53.66A8,8,0,0,1,56,40H200A8,8,0,0,1,205.64,53.66ZM128,128,50.36,202.34A8,8,0,0,0,56,216H200a8,8,0,0,0,5.66-13.66Z" opacity="0.2"></path><path d="M211.18,196.56,139.57,128l71.61-68.56a1.59,1.59,0,0,1,.13-.13A16,16,0,0,0,200,32H56A16,16,0,0,0,44.69,59.31a1.59,1.59,0,0,1,.13.13L116.43,128,44.82,196.56a1.59,1.59,0,0,1-.13.13A16,16,0,0,0,56,224H200a16,16,0,0,0,11.32-27.31A1.59,1.59,0,0,1,211.18,196.56ZM56,48h0v0Zm144,0-72,68.92L56,48ZM56,208l72-68.92L200,208Z"></path></svg>},
    {id: "companies", name: "Companies", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-6 fill-elements-midem"><path d="M112,80A32,32,0,1,1,80,48,32,32,0,0,1,112,80Zm64,32a32,32,0,1,0-32-32A32,32,0,0,0,176,112ZM80,144a32,32,0,1,0,32,32A32,32,0,0,0,80,144Zm96,0a32,32,0,1,0,32,32A32,32,0,0,0,176,144Z" opacity="0.2"></path><path d="M80,40a40,40,0,1,0,40,40A40,40,0,0,0,80,40Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,80,104Zm96,16a40,40,0,1,0-40-40A40,40,0,0,0,176,120Zm0-64a24,24,0,1,1-24,24A24,24,0,0,1,176,56ZM80,136a40,40,0,1,0,40,40A40,40,0,0,0,80,136Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,80,200Zm96-64a40,40,0,1,0,40,40A40,40,0,0,0,176,136Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,176,200Z"></path></svg>},
];

const scrollLeft = () => {
  const container = document.getElementById('category-scroll');
  if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
  }
};

const scrollRight = () => {
  const container = document.getElementById('category-scroll');
  if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
  }
};

export default function CategorySelector() {
  const { creatorProfileAccounts } = useTimeFunProgram();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [category, setCategory] = useState<CategoryType>("all");

  // const filteredProfiles = selectedCategory === "all" 
  //   ? creatorProfileAccounts.data 
  //   : creatorProfileAccounts.data?.filter(profile => profile.account.category === selectedCategory);

  const handleCategorySelect = (id: CategoryType) => {
    // setSelectedCategory(id); // ✅ no type error now
    setSelectedCategory(getCategoryType(id));
  };

  return (
    <div className="border-y border-pink-500/10 bg-gradient-to-r from-pink-950/5 to-purple-950/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-3xl font-bold mb-6 text-center">
                Explore by <span className="text-pink-400">Category</span>
            </h2>
            {/* <div className="overflow-x-auto">
                <div className="flex gap-3 pb-4 min-w-max my-5 mx-5">
                    {categoryTabs.map((category) => (
                      <button
                        key={category.id}
                        className="group flex flex-col items-center gap-2 px-6 py-4 bg-gradient-to-br from-pink-950/10 to-purple-950/10 hover:from-pink-950/30 hover:to-purple-950/30 border border-pink-500/20 hover:border-pink-500/50 rounded-xl transition-all duration-300 min-w-[120px] transform hover:scale-105"
                      >
                        <span className="text-3xl group-hover:scale-110 transition-transform">
                          {category.icon}
                        </span>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white whitespace-nowrap transition-colors">
                          {category.name}
                        </span>
                      </button>
                    ))}
                    {creatorProfileAccounts.data?.map((profile) => (
                      <div key={profile.publicKey.toString()} className='flex gap-5 border-pink-500 rounded-2xl'>
                        <Image src={profile.account.image} alt='Image' width={100} height={100} />
                        <h1 className='font-bold text-xl'>{profile.account.name}</h1>
                      </div>
                    ))}
                </div>
            </div> */}

            {/* TODO: fix below code */}
            <div className="relative mb-12">
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-full shadow-lg shadow-pink-500/50 transition-all duration-300 transform hover:scale-110"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                
                <div 
                    className="overflow-x-auto scrollbar-hide" 
                    id="category-scroll"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style>{`#category-scroll::-webkit-scrollbar { display: none; }`}</style>
                    <div className="flex gap-3 pb-4 min-w-max px-12">
                        {categoryTabs.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id as CategoryType)} // fix this error Argument of type 'string' is not assignable to parameter of type 'CategoryType'.
                                // onClick={() => handleCategorySelect(category.id)}
                                className={`group flex flex-col items-center gap-2 px-6 py-4 rounded-xl transition-all duration-300 min-w-[120px] transform hover:scale-105 ${
                                    selectedCategory === category.id
                                        ? 'bg-gradient-to-br from-pink-600/30 to-purple-600/30 border-2 border-pink-500'
                                        : 'bg-gradient-to-br from-pink-950/10 to-purple-950/10 border border-pink-500/20 hover:border-pink-500/50'
                                }`}
                            >
                                <span className={`text-3xl group-hover:scale-110 transition-transform ${
                                    selectedCategory === category.id ? 'scale-110' : ''
                                }`}>
                                    {category.icon}
                                </span>
                                <span className={`text-sm font-medium whitespace-nowrap transition-colors ${
                                    selectedCategory === category.id ? 'text-white font-bold' : 'text-gray-300 group-hover:text-white'
                                }`}>
                                    {category.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-full shadow-lg shadow-pink-500/50 transition-all duration-300 transform hover:scale-110"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>
            </div>

            {creatorProfileAccounts.data
              ?.filter((profile) => getCategoryType(profile.account.category)) // fix this This comparison appears to be unintentional because the types 'DecodeEnum<{ kind: "enum"; variants: [{ name: "timeFunTeam"; }, { name: "founders"; }, { name: "influencers"; }, { name: "investors"; }, { name: "designer"; }, { name: "athletes"; }, { name: "solana"; }, { ...; }, { ...; }, { ...; }, { ...; }]; }, DecodedHelper<...>>' and 'string' have no overlap.
              .map((profile) => (
                <div key={profile.publicKey.toString()} className='flex gap-5 border-pink-500 rounded-2xl'>
                  <Image src={profile.account.image} alt='Image' width={100} height={100} />
                  <h1 className='font-bold text-xl'>{profile.account.name}</h1>
                </div>
            ))}  

        </div>
    </div>
  );
    // return (
    //   <div className="flex grid-flow-col gap-4 border-b">
    //     {categoryTabs.map((tab) => (
    //       <button 
    //         key={tab.id} 
    //         className="flex flex-col items-center gap-2 p-3 rounded-lg  transition-colors cursor-pointer"
    //         // className='font-medium outline-none border-b-2 text-elements-lowem border-transparent hover:text-elements-highem-alpha data-[state=active]:border-controls-primary data-[state=active]:text-foreground py-3 px-4 flex flex-col items-center justify-center gap-2 text-base md:px-4 md:py-6 [&>svg]:data-[state=active]:text-elements-accent'
    //       >
    //         <div className="flex items-center justify-center">
    //           {tab.img}
    //         </div>
    //         <span className="text-sm text-gray-400 hover:text-white whitespace-nowrap">
    //           {tab.name}
    //         </span>
    //       </button>
    //     ))}
    //   </div>
    // );
}