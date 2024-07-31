export default function PageLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div className="mx-8 lg:m-0">
            {children}
        </div>
    )
}
