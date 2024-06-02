using Microsoft.AspNetCore.Mvc;
using System; using System.IO;
using System.Net;
using System.Threading.Tasks;

namespace StreamingApi.Controllers {
   [Route("api/[controller]")]
   [ApiController]
   public class VideoController : ControllerBase
   { 
      private readonly string _videoFolderPath = "C:\\Users\\mohd.majeed\\Downloads\\Streaming\\StreamingApi\\StreamingApi\\video\\"; // Set your video path here 

      [HttpGet("{fileName}")] 
      public async Task < IActionResult > StreamVideo(string fileName)
      {
         if (string.IsNullOrWhiteSpace(fileName) || fileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0) {
            return BadRequest("Invalid file name.");
         } 
             string filePath = Path.Combine(System.IO.Directory.GetCurrentDirectory() + "\\Video", fileName);
         if (!System.IO.File.Exists(filePath)) {
            return NotFound("Video file not found.");
         }
         //var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
         //var fileLength = fileStream.Length; var fileLength = new FileInfo(filePath).Length; // Check if the Range header is present
         if (Request.Headers.ContainsKey("Range")) {
            var rangeHeader = Request.Headers["Range"].ToString();
            var range = rangeHeader.Replace("bytes=", "").Split('-'); 
            long start = string.IsNullOrEmpty(range[0]) ? 0 : Convert.ToInt64(range[0]); 
            long end = range.Length > 1 && !string.IsNullOrEmpty(range[1]) ? Convert.ToInt64(range[1]) : fileLength - 1; if (start > end || end >= fileLength) {
               return BadRequest("Invalid Range header.");
            }
            var contentLength = end - start + 1;
            var contentRange = $"bytes {start}-{end}/{fileLength}";
            Response.Headers["Accept-Ranges"] = "bytes";
            Response.Headers["Content-Range"] = contentRange;
            Response.Headers["Content-Length"] = contentLength.ToString();
            Response.ContentType = "video/mp4";
            Response.StatusCode = (int)HttpStatusCode.PartialContent;
            //fileStream.Seek(start, SeekOrigin.Begin); 
            //return new FileStreamResult(fileStream, "video/mp4") 
            //{ // FileDownloadName = fileName //}; 
            var buffer = new byte[contentLength];
            using(var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
               {
                  fileStream.Seek(start, SeekOrigin.Begin);
            fileStream.Read(buffer, 0, buffer.Length);
         }
         return File(buffer, "video/mp4", enableRangeProcessing: true);
      }
                                else
      {
         // Return the entire file if no Range header is present 
         return PhysicalFile(filePath, "video/mp4");
      }
   }
}
                                     }