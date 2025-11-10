import './TogglePanel.css'
import { Link } from 'react-router-dom'

export default function TogglePanel ({isOpen}) {


    return (
        <div className={`TogglePanelBlock ${isOpen ? 'open' : ''}`}>
            {isOpen && (
                <>
                    <h3>Panel Menu</h3>
                    <div className="list">
                        <Link to="/pagetags">
                            <div className="divButtonTagsGroup">
                                Sorted tags
                            </div>
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}