const Response = require("../middlewares/response");
const ContentService = require("../services/contentService");

async function addContent(req, res) {
  try {
    const userPerformer = req.user;
    const content = req.body;
    const newContent = await ContentService.addContent(userPerformer, content);
    return Response.success(res, "Content created successfully", newContent);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function getContentByUserId(req, res) {
  try {
    const userId = req.query.userId;
    const userPerformer = req.user;
    const content = await ContentService.getContentByUserId(
      userPerformer,
      userId
    );
    return Response.success(
      res,
      `${content.length} Content fetched successfully`,
      content
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function getContentById(req, res) {
  try {
    const userPerformer = req.user;
    const id = req.params.id;
    const content = await ContentService.getContentById(userPerformer, id);
    return Response.success(res, "Content fetched successfully", content);
  } catch (error) {
    return Response.error(res, error);
  }
}

async function updateContent(req, res) {
  try {
    const userPerformer = req.user;
    const id = req.params.id;
    const content = req.body;
    const updatedContent = await ContentService.updateContent(
      userPerformer,
      id,
      content
    );
    return Response.success(
      res,
      "Content updated successfully",
      updatedContent
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function deleteContent(req, res) {
  try {
    const userPerformer = req.user;
    const id = req.params.id;
    const deletedContent = await ContentService.deleteContent(
      userPerformer,
      id
    );
    return Response.success(
      res,
      "Content deleted successfully",
      deletedContent
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function AllContentByClientId(req, res) {
  try {
    const userPerformer = req.user;
    const id = req.params.id;
    const foundContent = await ContentService.AllContentByClientId(
      userPerformer,
      id
    );
    return Response.success(res, "Content found successfully", foundContent);
  } catch (error) {
    return Response.error(res, error);
  }
}

module.exports = {
  addContent,
  getContentByUserId,
  getContentById,
  updateContent,
  deleteContent,
  AllContentByClientId,
};
