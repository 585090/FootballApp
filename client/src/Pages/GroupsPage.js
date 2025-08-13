import { GroupList } from "../Components/GroupList";
import { NavigationBar } from "../Components/utils/NavigationBar";


export default function GroupsPage() {

    return (
        <div>
            <NavigationBar />
            <div>
                <GroupList />
            </div>
        </div>
    )
}