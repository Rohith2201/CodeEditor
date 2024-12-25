import Image from 'next/image'
import { useRouter } from 'next/router'

interface HeaderProps {
  assignmentName?: string;
  timeRemaining?: number; // in seconds
}

export default function Header({ assignmentName, timeRemaining }: HeaderProps) {
  const router = useRouter()
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Image
              src="/Blue_Grey_Corporate_Illustrated_Collaboration_LinkedIn_Banner__3_-removebg-preview.png"
              alt="Cybersa Solutions LLP"
              width={150}
              height={40}
              className="cursor-pointer"
              onClick={() => router.push('/')}
            />
          </div>
          {assignmentName && (
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">{assignmentName}</h1>
              {timeRemaining !== undefined && (
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-gray-900">
                    Time Remaining: {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

