"""Email alerts for task assignments and filed incidents."""
from core import esc
import asyncio
from core import send_email

async def _notify_task_assigned(task_doc: dict, manager: dict, concierge: dict):
    """Email concierge when manager assigns a task."""
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#FF385C;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin:0 0 6px">Noted · Task Assignment</p>
        <h1 style="color:white;font-size:20px;font-weight:800;margin:0">New task assigned to you</h1>
      </div>
      <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        <p style="color:#444;font-size:15px;line-height:1.7">Hi {esc(concierge['first_name'])},</p>
        <p style="color:#444;font-size:15px;line-height:1.7">
          <strong>{esc(manager['first_name'])} {esc(manager['last_name'])}</strong> has assigned you a new task:
        </p>
        <div style="background:#f8f8f8;border:1px solid #ebebeb;border-radius:12px;padding:20px 24px;margin:20px 0">
          <p style="font-size:17px;font-weight:700;color:#111;margin:0 0 8px">{esc(task_doc['title'])}</p>
          <p style="color:#666;font-size:14px;margin:0 0 6px">Due: {esc(task_doc.get('due_time','ASAP'))} · Priority: {esc(task_doc.get('priority','Standard'))}</p>
          {f'<p style="color:#444;font-size:14px;margin:8px 0 0">{esc(task_doc["notes"])}</p>' if task_doc.get('notes') else ''}
        </div>
        <p style="color:#aaa;font-size:13px;margin-top:20px">Log in to Noted to view and complete this task.</p>
      </div>
    </div>"""
    asyncio.create_task(send_email(concierge['email'], f"New task: {task_doc['title']}", html))

async def _notify_incident_filed(incident_doc: dict, manager: dict, concierge_name: str):
    """Email manager when concierge files an incident."""
    if (manager.get('notification_prefs') or {}).get('incident', True) is False:
        return
    sev_color = {'critical': '#FF3B30', 'high': '#FF3B30', 'medium': '#FF9500', 'low': '#34C759'}.get(incident_doc.get('severity','medium'), '#FF9500')
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#111827;border-radius:16px 16px 0 0;padding:28px 32px">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin:0 0 6px">Noted · Incident Report</p>
        <h1 style="color:white;font-size:20px;font-weight:800;margin:0">{esc(incident_doc['type'])} — {esc(incident_doc['location'])}</h1>
        <span style="display:inline-block;margin-top:10px;padding:4px 12px;background:{esc(sev_color)};border-radius:999px;font-size:12px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:0.05em">{esc(incident_doc.get('severity','medium'))}</span>
      </div>
      <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        <p style="color:#444;font-size:15px;line-height:1.7">Hi {esc(manager['first_name'])},</p>
        <p style="color:#444;font-size:15px;line-height:1.7">
          <strong>{esc(concierge_name)}</strong> filed an incident report at <strong>{esc(manager['property_name'])}</strong>:
        </p>
        <div style="background:#f8f8f8;border:1px solid #ebebeb;border-radius:12px;padding:20px 24px;margin:20px 0">
          <p style="font-weight:700;color:#111;margin:0 0 8px">{esc(incident_doc['description'])}</p>
          {f'<p style="color:#444;font-size:14px;margin:6px 0 0">{esc(incident_doc["notes"])}</p>' if incident_doc.get('notes') else ''}
          {f'<p style="color:#666;font-size:13px;margin:8px 0 0">Unit: {esc(incident_doc["unit_number"])}</p>' if incident_doc.get('unit_number') else ''}
          {f'<p style="color:#666;font-size:13px;margin:4px 0 0">Person: {esc(incident_doc["person_involved"])}</p>' if incident_doc.get('person_involved') else ''}
        </div>
        <p style="color:#aaa;font-size:13px">Log in to Noted to review and resolve this incident.</p>
      </div>
    </div>"""
    asyncio.create_task(send_email(manager['email'], f"🚨 Incident: {incident_doc['type']} at {manager['property_name']}", html))
