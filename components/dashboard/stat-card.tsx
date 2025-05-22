import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function StatCard({ 
  title,
  value,
  icon,
  color
}: { 
  title: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card className="border-border/50 bg-background/80 backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-full p-2 ${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}