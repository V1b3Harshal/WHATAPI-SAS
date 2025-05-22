export default function ActivityItem({ 
    title,
    time,
    description
  }: { 
    title: string
    time: string
    description: string
  }) {
    return (
      <div className="flex gap-4">
        <div className="relative flex flex-col items-center">
          <div className="h-3 w-3 rounded-full bg-primary mt-1" />
          <div className="w-px h-full bg-border" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground">{title}</h4>
            <span className="text-xs text-muted-foreground">{time}</span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    )
  }