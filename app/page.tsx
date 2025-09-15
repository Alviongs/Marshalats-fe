import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/intro-bg.png')",
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-48 h-48 rounded-full bg-yellow-400 border-4 border-yellow-500 flex items-center justify-center relative">
            <div className="w-40 h-40 rounded-full bg-black flex items-center justify-center">
              <div className="text-center">
                <div className="text-yellow-400 font-bold text-2xl mb-1">ROCK</div>
                <div className="text-yellow-400 text-xs font-semibold">MARTIAL ARTS ACADEMY</div>
                <div className="text-yellow-400 text-xs font-semibold mt-1">FITNESS & DANCE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black text-center mb-4 max-w-4xl leading-tight">
          {"TRAIN LIKE A WARRIOR, CONQUER LIKE A CHAMPION."}
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl font-semibold text-black text-center mb-12 max-w-3xl">
          {"STRENGTH OF THE BODY, DISCIPLINE OF THE MIND, SPIRIT OF A WARRIOR."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-12 py-6 rounded-lg min-w-[160px]">
              SIGN IN
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gray-800 hover:bg-gray-900 text-white font-bold text-lg px-12 py-6 rounded-lg min-w-[160px]">
              REGISTER
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
