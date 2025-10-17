export default function Header({ text }) {
    return (
        <div className="w-full h-[100px] bg-[#AFAFAF] rounded-b-[15px] flex items-center justify-center">
            <p className="text-[#161616] text-4xl font-[Inter]] [@media(max-width:199px)]:text-3xl">{text}</p>
        </div>
    )
}
