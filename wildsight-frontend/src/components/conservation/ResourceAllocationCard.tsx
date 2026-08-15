import {
    DollarSign,
    Users,
    Camera,
    Plane,
    Truck,
} from "lucide-react";

interface Props{

    data:{

        budgetPriority:string;

        fieldStaffRequired:number;

        cameraTrapsRequired:number;

        dronesRequired:number;

        deploymentStrategy:string;

    };

}

export default function ResourceAllocationCard({

    data

}:Props){

    return(

        <div
        className="
        bg-white
        rounded-3xl
        shadow-sm
        border
        p-6
        hover:shadow-xl
        transition-all
        "
        >

            {/* Header */}

            <div
            className="
            flex
            items-center
            gap-3
            mb-6
            "
            >

                <div
                className="
                bg-green-100
                p-3
                rounded-2xl
                "
                >

                    <DollarSign
                    className="
                    text-green-600
                    "
                    />

                </div>

                <div>

                    <h2
                    className="
                    text-2xl
                    font-bold
                    "
                    >

                        Resource Allocation

                    </h2>

                    <p
                    className="
                    text-gray-500
                    "
                    >

                        AI resource planning

                    </p>

                </div>

            </div>

            {/* Budget */}

            <div
            className="
            bg-green-50
            border
            border-green-100
            rounded-2xl
            p-5
            mb-5
            "
            >

                <h3 className="font-semibold">

                    Budget Priority

                </h3>

                <span
                className="
                inline-block
                mt-3
                bg-green-600
                text-white
                px-4
                py-2
                rounded-full
                font-semibold
                "
                >

                    {data.budgetPriority}

                </span>

            </div>

            {/* Resources */}

            <div
            className="
            grid
            grid-cols-2
            gap-4
            "
            >

                <ResourceItem

                    icon={<Users className="text-blue-600"/>}

                    title="Field Staff"

                    value={data.fieldStaffRequired}

                />

                <ResourceItem

                    icon={<Camera className="text-green-600"/>}

                    title="Camera Traps"

                    value={data.cameraTrapsRequired}

                />

                <ResourceItem

                    icon={<Plane className="text-orange-600"/>}

                    title="Drones"

                    value={data.dronesRequired}

                />

                <ResourceItem

                    icon={<Truck className="text-purple-600"/>}

                    title="Deployment"

                    value="Ready"

                />

            </div>

            {/* Strategy */}

            <div
            className="
            mt-6
            rounded-2xl
            border
            bg-blue-50
            border-blue-100
            p-5
            "
            >

                <h3
                className="
                font-semibold
                mb-2
                "
                >

                    Deployment Strategy

                </h3>

                <p
                className="
                text-gray-700
                leading-relaxed
                "
                >

                    {data.deploymentStrategy}

                </p>

            </div>

        </div>

    );

}

interface ResourceProps{

    icon:React.ReactNode;

    title:string;

    value:string|number;

}

function ResourceItem({

    icon,

    title,

    value

}:ResourceProps){

    return(

        <div
        className="
        bg-slate-50
        rounded-2xl
        p-4
        text-center
        "
        >

            <div
            className="
            flex
            justify-center
            mb-2
            "
            >

                {icon}

            </div>

            <p
            className="
            text-gray-500
            text-sm
            "
            >

                {title}

            </p>

            <h3
            className="
            text-xl
            font-bold
            mt-2
            "
            >

                {value}

            </h3>

        </div>

    );

}