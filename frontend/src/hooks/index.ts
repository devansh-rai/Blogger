/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import axios from "axios";
import { BACKEND_URL } from "../../config.ts";
import { useNavigate } from "react-router-dom";

export interface Blog {
    "content": string;
    "title": string;
    "id": number
    "author": {
        "name": string
    }
}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();
    const navigate = useNavigate();


    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                setBlog(response.data.blog);
                setLoading(false);
            }).catch(err=>{
                console.log(err);
                navigate("/signin");
            })
    }, [id])

    return {
        loading,
        blog
    }

}
export const useBlogs = (): { loading: boolean, blogs: Blog[] | undefined } => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(response => {
                if(response.data.status === 403){
                    console.log("error");
                    navigate("/signin");
                }
                else{
                    setBlogs(response.data.blogs);
                    setLoading(false);
                }
                // console.log(response.data.status);
            }).catch(err => {
                console.log(err);
                navigate("/signin");
            })
    }, [])

    return {
        loading,
        blogs
    }
}