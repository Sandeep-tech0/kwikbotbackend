const Response = require("../middlewares/response");
const LeadsCaptureService = require("../services/leadCaptureService");

async function addLeadCapture(req, res) {
  try {
    const userPerformer = req.user;
    const leadCapture = req.body;
    const newLeadCapture = await LeadsCaptureService.addLeadCapture(
      userPerformer,
      leadCapture
    );
    return Response.success(
      res,
      "Lead Capture created successfully",
      newLeadCapture
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function getLeadCaptures(req, res) {
  try {
    const userPerformer = req.user;
    const clientId = req.query.clientId;
    const leadCaptures = await LeadsCaptureService.getLeadCaptures(
      userPerformer,
      clientId
    );
    return Response.success(
      res,
      "Lead Captures fetched successfully",
      leadCaptures
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function getLeadCaptureById(req, res) {
  try {
    const userPerformer = req.user;
    const leadCaptureId = req.params.id;
    const leadCapture = await LeadsCaptureService.getLeadCaptureById(
      userPerformer,
      leadCaptureId
    );
    return Response.success(
      res,
      "Lead Capture fetched successfully",
      leadCapture
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function updateLeadCaptureById(req, res) {
  try {
    const userPerformer = req.user;
    const leadCaptureId = req.params.id;
    const leadCapture = req.body;
    const updatedLeadCapture = await LeadsCaptureService.updateLeadCaptureById(
      userPerformer,
      leadCaptureId,
      leadCapture
    );
    return Response.success(
      res,
      "Lead Capture updated successfully",
      updatedLeadCapture
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function deleteLeadCaptureById(req, res) {
  try {
    const userPerformer = req.user;
    const leadCaptureId = req.params.id;
    const leadCapture = await LeadsCaptureService.deleteLeadCaptureById(
      userPerformer,
      leadCaptureId
    );
    return Response.success(
      res,
      "Lead Capture deleted successfully",
      leadCapture
    );
  } catch (error) {
    return Response.error(res, error);
  }
}

async function sendNewLeadMail(req, res) {
  try {
    const leadBody = req.body;
    await LeadsCaptureService.sendLeadMail(
      leadBody.email,
      leadBody.name,
      leadBody.phone
    );
    return Response.success(res, "Mail sent successfully");
  } catch (error) {
    return Response.error(res, error);
  }
}

async function getAllLeadData(req, res) {
  try {
    const leaddata = await LeadsCaptureService.getLeadData();
    return Response.success(res, "All Lead Data", leaddata);
  } catch (error) {
    return Response.error(res, error);
  }
}

module.exports = {
  addLeadCapture,
  getLeadCaptures,
  getLeadCaptureById,
  updateLeadCaptureById,
  deleteLeadCaptureById,
  sendNewLeadMail,
  getAllLeadData,
};
