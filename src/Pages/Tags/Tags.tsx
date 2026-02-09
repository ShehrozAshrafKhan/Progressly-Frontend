import { useState, useEffect } from "react";
import { CiEdit } from "react-icons/ci";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import config from "../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";

type Tag = {
  tagId: string;
  tagName: string;
  isActive: boolean;
};
const Tags = () => {
  const navigate = useNavigate();
  const [tblData, setTblData] = useState<Tag[]>([]);

  useEffect(() => {
    handleGetTags();
  }, []);

  const handleGetTags = async () => {
    try {
      const url = `${config.baseUrl}Tags/GetTags`;
      const response = await axios.get(url);

      if (
        response?.data?.result?.succeeded === false &&
        response.data.result.errors?.length > 0
      ) {
        ShowMessage(2, response.data.result.errors[0]);
      } else if (response?.data?.result?.succeeded === true) {
        setTblData(response.data.data);
        console.log(response.data.data);
      } else {
        console.log(response.data.data);
        ShowMessage(2, "No Tags data found.");
      }
    } catch (e: any) {
      ShowMessage(
        2,
        e.message || "Something went wrong while fetching Tags."
      );
    }
  };

  const handleAddNewTag=()=>{
    navigate("/admin/addNewTag");
  }

  const handleEdit=(tagId:string)=>{
     navigate(`/admin/editTag/${tagId}`);
  }

const handleInputChange = (tagId: string) => {
  const updatedData = tblData.map((item) =>
    item.tagId === tagId
      ? { ...item, isActive: !item.isActive }
      : item
  );
  setTblData(updatedData);
   const updatedObj = updatedData.find((x) => x.tagId === tagId);
   handleSubmit(updatedObj);
};


const handleSubmit=async(updatedObj:any)=>{
  try{
  console.log(updatedObj);
  const url=`${config.baseUrl}Tags/UpdateTag`
  const response= await axios.patch(url,updatedObj);
  if (response.data.result.succeeded===false&&response.data.result.errors.length>0) {
    ShowMessage(2,response.data.result.errors[0])
  }else if(response.data.result.succeeded===true){
    ShowMessage(1,"Status Updated Successfully");
  }else{
    ShowMessage(2,"Something went wrong while saving");
  }
  }catch(err:any){
   ShowMessage(2,err.message||"Something went wrong while saving");
  }
}

  const handlePrintTags = async () => {
  try {
    const response = await axios.get(`${config.baseUrl}Reports/TagsReport`, {
      responseType: "blob", 
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  } catch (error) {
    ShowMessage(2,"Failed to generate report.");
  }
};


  return (
    <Layout>
    
      <h1>Tags</h1>
       <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-2">
          <button className="btn btn-primary me-md-2" type="button" onClick={handlePrintTags}>
            Print
          </button>
          <button className="btn btn-success me-md-2" type="button" onClick={handleAddNewTag}>
            Add New
          </button>
        </div>
      <div className="card mt-3">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                 <tr>
              <th>Tag Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
              </thead>
              <tbody>
                {tblData.map((item, index) => (
              <tr key={item.tagId || index}>
                <td>{item.tagName}</td>
                <td>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input cursor-pointer"
                      type="checkbox"
                      role="switch"
                      id={`flexSwitchCheckChecked-${index}`}
                      checked={item.isActive}
                       style={{ width: "3rem", height: "1.5rem" }}
                      onChange={() => handleInputChange(item.tagId)}
                    />
                  </div>
                </td>
                <td>
                  <CiEdit fontSize={25} className="cursor-pointer" onClick={()=>handleEdit(item.tagId)} />
                </td>
              </tr>
            ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tags;
