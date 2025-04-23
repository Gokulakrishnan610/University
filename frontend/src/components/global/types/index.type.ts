export type WorkspaceProps = {
    data: {
        subscription: {
            plan: 'FREE' | 'PRO'
        } | null
        workspace: {
            id: string,
            name: string
            type: 'PUBLIC' | 'PERSONAL'
        }[]
        members: {
            WorkSpace: {
                id: string,
                name: string
                type: 'PUBLIC' | 'PERSONAL'
            }
        }[]
    }
}

export type NotificationProps = {
    status: number,
    data: {
        _count: {
            notification: number
        }
    }
}

export type FoldersProps = {
    status: number,
    data: ({
        _count: {
            videos: number
        }
    } & {
        id: string;
        name: string
        createdAt: Date
        workSpaceId: string | null
    })[]
}

export type FolderProps = {
    status: number,
    data: ({
        _count: {
            videos: number
        }
    } & {
        name: string
    })
}

export type VideosProps = {
    status: number,
    data: {
        id: string
        title: string | null
        createdAt: Date
        source: string
        processing: boolean
        Folder: {
            id: string
            name: string
        } | null
        User: {
            firstname: string | null;
            lastname: string | null
            image: string | null
        } | null
    }[]
}

export type VideoProps = {
    status: number,
    data: {
        id: string
        title: string | null;
        description: string;
        createdAt: Date
        source: string
        processing: boolean
        views: number;
        summery: string;
        User: {
            firstname: string | null;
            lastname: string | null
            image: string | null;
            id: string,
            subscription: {
                plan: 'PRO' | 'FREE'
            } | null,
            trial: boolean,
            clerkid: string,
        } | null
    },
    author: boolean,
    authenticated?: boolean
}

export type CommentRepliesProps = {
    id: string
    createdAt: Date
    comment: string;
    User: {
        id: string;
        email: string;
        createdAt: DataView;
        clerkId: string;
        trial: boolean;
        firstView: boolean;
        image: string | null;
        firstname: string;
        lastname: string
    } | null
    userId: string | null;
    videoId: string | null;
    commentId: string | null;
}

export type VideoCommentsProps = {
    data: {
        id: string
        createdAt: Date
        comment: string;
        reply: CommentRepliesProps[]
        User: {
            id: string;
            email: string;
            createdAt: DataView;
            clerkId: string;
            trial: boolean;
            firstView: boolean;
            image: string | null;
            firstname: string;
            lastname: string
        } | null
        userId: string | null;
        videoId: string | null;
        commentId: string | null;
    }[],
    status: number
}